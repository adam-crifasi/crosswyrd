import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { PuzCrossword } from '@confuzzle/puz-crossword';
import { useSelector } from 'react-redux';
import {
  selectPuzzle,
  selectClueGrid,
  selectPublishInfo,
} from '../builder/builderSlice';
import sanitizeFilename from 'sanitize-filename';
import { getAnswerGrid } from '../builder/ClueEntry';

function downloadFromBuffer(buffer: Buffer, filename: string) {
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

export default function ExportPuzzle({ onExport }: { onExport: () => void }) {
  const puzzle = useSelector(selectPuzzle);
  const clueGrid = useSelector(selectClueGrid);
  const publishInfo = useSelector(selectPublishInfo);

  const exportPuzzle = () => {
    if (!clueGrid) return;

    const solution: string = puzzle.tiles
      .flatMap((row) =>
        row.flatMap((tile) =>
          tile.value === 'black'
            ? '.'
            : tile.value === 'empty'
              ? ' '
              : tile.value.toUpperCase()
        )
      )
      .join('');
    const title = publishInfo.title || 'Default Title';
    const author = publishInfo.author || 'Default Author';
    const clues: string[] = getAnswerGrid(puzzle).flatMap((row, rowIndex) =>
      row.flatMap(({ across, down }, columnIndex) => {
        if (!across && !down)
          // No clue could possibly appear here
          return [];

        const clueCell = clueGrid[rowIndex]?.[columnIndex];
        if (!clueCell)
          // No clue specified here
          return '';

        const acrossClue = across ? [clueCell.across ?? ''] : [];
        const downClue = down ? [clueCell.down ?? ''] : [];

        return [...acrossClue, ...downClue];
      })
    );
    const puz = new PuzCrossword({
      solution: solution,
      title,
      author,
      copyright: `Copyright ${author}, all rights reserved`,
      height: puzzle.tiles.length,
      width: puzzle.tiles.length > 0 ? puzzle.tiles[0].length : 0,
      note: 'Created using Crosswyrd (crosswyrd.app)',
      clues,
    });
    downloadFromBuffer(puz.toBuffer(), `${sanitizeFilename(title)}.puz`);

    onExport();
  };

  return (
    <ListItemButton onClick={exportPuzzle}>
      <ListItemIcon>
        <FileDownloadIcon />
      </ListItemIcon>
      <ListItemText primary="Export" />
    </ListItemButton>
  );
}
