import React, { useContext, ChangeEvent, useState } from 'react'
import {
  Grid,
  Typography,
  ListItemText,
  Backdrop,
  CircularProgress,
  Slide,
} from '@mui/material'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CancelIcon from '@mui/icons-material/Cancel'
import {
  StyledChildBox,
  StyledList,
  StyledListItem,
  StyledSubmitBtn,
  StyledSuccessBox,
  StyledTextField,
  StyledTypography,
} from '../styles/newElectionStyle'
import { AuthorityContext, Election } from '../context/AuthorityContext'

function NewElection() {
  const { isBallotInitialized, isBallotLoading, initializeBallot } =
    useContext(AuthorityContext)

  const [electionState, setElectionState] = useState<Election>({
    name: '',
    startTime: null as unknown as number,
    endTime: null as unknown as number,
  })

  const handleNameChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = e.target
    setElectionState({
      ...electionState,
      [name]: value,
    })
  }

  const handleTimeChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = e.target
    const dateValue = new Date(value)
    setElectionState({
      ...electionState,
      [field]: dateValue.getTime() as unknown as number,
    })
  }

  const handleOnSubmitBtn = () => {
    initializeBallot(electionState)
  }

  return (
    <>
      <Grid sx={{ justifyContent: 'space-around', paddingTop: 8 }} container>
        <Grid item md={12}>
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
              paddingBottom: 10,
            }}
            variant="h5"
          >
            Initialize Ballot
          </Typography>
        </Grid>
        <Grid item mx={6}>
          <StyledList>
            <StyledListItem sx={{ listStyle: 'none' }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 70, color: 'red' }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: 'red' }}
              >
                Be careful
              </Typography>
            </StyledListItem>
            <StyledListItem>
              <ListItemText>
                Please be sure before Initialize Ballot
              </ListItemText>
            </StyledListItem>
            <StyledListItem>
              <ListItemText>You can't modify after confirmation.</ListItemText>
            </StyledListItem>
            <StyledListItem>
              <ListItemText>
                Only an authorized person has rights to Initialize Ballot.
              </ListItemText>
            </StyledListItem>
          </StyledList>
        </Grid>
        <Grid item mx={6}>
          <StyledChildBox>
            <StyledTypography>Election Name:</StyledTypography>
            <StyledTextField
              value={electionState.name}
              autoComplete="off"
              name="name"
              onChange={handleNameChange}
              placeholder="Enter Election name"
              type="text"
            />
          </StyledChildBox>
          <StyledChildBox>
            <StyledTypography>
              Enter Election start Date & Time
            </StyledTypography>
            <StyledTextField
              name="startTime"
              onChange={(e) => handleTimeChange(e, 'startTime')}
              type="datetime-local"
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
            />
          </StyledChildBox>
          <StyledChildBox>
            <StyledTypography>Enter Election end Date & Time</StyledTypography>
            <StyledTextField
              onChange={(e) => handleTimeChange(e, 'endTime')}
              name="endTime"
              type="datetime-local"
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
            />
          </StyledChildBox>
          <StyledSubmitBtn onClick={handleOnSubmitBtn}>
            Initialize
          </StyledSubmitBtn>
        </Grid>
      </Grid>

      <Slide direction="up" in={isBallotInitialized} mountOnEnter unmountOnExit>
        <StyledSuccessBox>
          <Typography color={'white'}>Successful</Typography>
          <CancelIcon sx={{ cursor: 'pointer' }} />
        </StyledSuccessBox>
      </Slide>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isBallotLoading}
      >
        <CircularProgress sx={{ color: 'gray' }} />
      </Backdrop>
    </>
  )
}

export default NewElection
