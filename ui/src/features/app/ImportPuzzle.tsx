import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PuzCrossword } from '@confuzzle/puz-crossword';
import { batch, useDispatch, useSelector } from 'react-redux';
import {
  selectPuzzle,
  selectClueGrid,
  selectPublishInfo,
  setPuzzleState,
  ClueGridType,
  setClueGrid,
  setPublishInfo,
  setWaveState,
  CrosswordPuzzleType,
  setFillAssistActive,
} from '../builder/builderSlice';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import _ from 'lodash';
import { getFlattenedAnswers } from '../builder/ClueEntry';
import { randomId } from '../../app/util';
import { waveFromPuzzle, WaveType } from '../builder/useWaveFunctionCollapse';
import { ALL_LETTERS } from '../builder/constants';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function ImportPuzzle({ onImport }: { onImport: () => void }) {
  const publishInfo = useSelector(selectPublishInfo);
  const dispatch = useDispatch();

  const importPuzzle = (file: File) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;
      const data = PuzCrossword.from(result);
      console.log(data);

      const puzzle: CrosswordPuzzleType = {
        tiles: _.times(data.height, (row) =>
          _.times(data.width, (column) => {
            const index = row * data.width + column;
            const solutionValue = data.solution[index];
            return {
              value:
                solutionValue === '.'
                  ? 'black'
                  : ALL_LETTERS.includes(solutionValue.toLowerCase())
                    ? solutionValue.toLowerCase()
                    : 'empty',
            };
          })
        ),
        version: randomId(),
      };
      const wave: WaveType = {
        ...waveFromPuzzle(puzzle),
        // Set a random puzzle version so that fill assist gets rerun (we do
        // not know what the wave should be off the bat)
        puzzleVersion: randomId(),
      };
      const clueGrid: ClueGridType = _.times(data.height, () =>
        _.times(data.width, () => ({ across: null, down: null }))
      );
      data.parsedClues.forEach((clue: any) => {
        clueGrid[clue.row][clue.col][clue.isAcross ? 'across' : 'down'] =
          clue.text;
      });

      batch(() => {
        dispatch(setPuzzleState(puzzle));
        dispatch(setWaveState(wave));
        dispatch(setClueGrid(clueGrid));
        dispatch(
          setPublishInfo({
            // Generally preserve publish info if present to allow importing
            // into an existing project and re-publishing that (e.g., if you've
            // saved multiple versions of a single puzzle)
            title: publishInfo.title ? publishInfo.title : data.title,
            author: publishInfo.author ? publishInfo.author : data.author,
            id: publishInfo.id,
          })
        );
        dispatch(setFillAssistActive(true));
      });
    };

    reader.onerror = console.error;

    onImport();
  };

  return (
    <ListItemButton component="label">
      <ListItemIcon>
        <FileUploadIcon />
      </ListItemIcon>
      <ListItemText primary="Import" />
      <VisuallyHiddenInput
        type="file"
        onChange={(event) => {
          if (!event.target.files || event.target.files?.length === 0) return;
          importPuzzle(event.target.files[0]);
        }}
        multiple
      />
    </ListItemButton>
  );
}
