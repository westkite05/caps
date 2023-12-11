import React, { createContext, useContext, useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import {
  useContract,
  useContractRead,
  useContractWrite,
  useStorageUpload,
} from '@thirdweb-dev/react'

export const AuthorityContext = createContext({})

interface ChildrenType {
  children: React.ReactNode
}

interface Election {
  name: string
  startTime: number
  endTime: number
}

interface VoterDetails {
  electionID: number | null
  name: string
  nid: number | null
  email: string
}

export const AuthorityContextProvider: React.FC<ChildrenType> = ({
  children,
}) => {
  const { contract } = useContract(process.env.NEXT_PUBLIC_CONTRACT_KEY)
  const [isBallotInitialized, setIsBallotInitialized] = useState<boolean>()
  const [isVoterRegistered, setIsVoterRegistered] = useState<boolean>()
  const [isVoterEmailSent, setIsVoterEmailSent] = useState<boolean>()
  const [isCandidateRegistered, setIsCandidateRegistered] = useState<boolean>()
  const [selectedElectionData, setSelectedElectionData] = useState<
    Election | {}
  >({})
  const [allElectionList, setAllElectionList] = useState<any[]>([])
  const [selectedElectionCandidate, setSelectedElectionCandidate] = useState<
    any[]
  >([])
  const [voteCountStatus, setVoteCountStatus] = useState<boolean>(false)
  const [isGivingVoteProcessLoading, setIsGivingVoteProcessLoading] =
    useState<boolean>()
  const [onGoingElection, setOngoingElection] = useState<any[]>([])
  const [previousElection, setPreviousElection] = useState<any[]>([])
  const [upComingElection, setUpComingElection] = useState<any[]>([])
  const [details, setDetails] = useState<VoterDetails>({
    electionID: null,
    nid: null,
    email: '',
    name: '',
  })

  const { data: electionList, isLoading: isElectionListLoading } =
    useContractRead(contract, 'getElections')

  useEffect(() => {
    const prev: any[] = []
    const ongoing: any[] = []
    const upcoming: any[] = []

    setAllElectionList(electionList)
    electionList?.forEach((election: any, index: number) => {
      const { startTime, endTime } = election
      const timeStamp = Date.now()

      if (timeStamp > endTime.toNumber()) {
        prev.push({ electionId: index, election })
      } else if (timeStamp < startTime.toNumber()) {
        upcoming.push({ electionId: index, election })
      } else {
        ongoing.push({ electionId: index, election })
      }
    })

    setPreviousElection(prev)
    setOngoingElection(ongoing)
    setUpComingElection(upcoming)
  }, [electionList])

  const { mutateAsync: createElection, isLoading: isBallotLoading } =
    useContractWrite(contract, 'createElection')

  const initializeBallot = async (value: Election) => {
    try {
      const { name, startTime, endTime } = value
      await createElection({
        args: [name, startTime, endTime, Date.now()],
      })
      setIsBallotInitialized(true)
    } catch (err) {
      setIsBallotInitialized(false)
    }
  }

  const { mutateAsync: registerVoter, isLoading: isVoterRegistrationLoading } =
    useContractWrite(contract, 'registerVoter')

  const { data: voterHash, isLoading: isVoterHashFinderLoading } =
    useContractRead(contract, 'getVoterHash', [details.electionID, details.nid])

  const registerVoterCall = async (value: VoterDetails) => {
    try {
      const { electionID, name, nid, email } = value
      await registerVoter({
        args: [electionID, name, nid, Date.now()],
      })
      setDetails({ electionID, nid, email, name })
    } catch (err) {
      setIsVoterRegistered(false)
    }
  }

  useEffect(() => {
    if (!isVoterHashFinderLoading && voterHash !== undefined) {
      sendEmailWithHash(voterHash)
    }
  }, [isVoterHashFinderLoading, voterHash])

  const sendEmailWithHash = (hash: any) => {
    const emailData = {
      to_email: details.email,
      from_name: 'Decentralized Voting System',
      to_name: details.name,
      message: hash,
    }

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID!,
        emailData,
        process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY
      )
      .then(
        (result) => {
          setIsVoterEmailSent(true)
        },
        (error) => {
          console.log('Email sending error: ', error)
        }
      )
  }

  const {
    mutateAsync: registerCandidate,
    isLoading: isCandidateRegistrationLoading,
  } = useContractWrite(contract, 'registerCandidate')

  const registerCandidateCall = async (value: any, file: File) => {
    try {
      const { name, nid, email, electionID, symbolName } = value
      const symbolUrl = await uploadFile(file)
      await registerCandidate({
        args: [electionID, name, nid, symbolName, symbolUrl[0], Date.now()],
      })
      setIsCandidateRegistered(true)
    } catch (err) {
      setIsCandidateRegistered(false)
    }
  }

  const { mutateAsync: upload } = useStorageUpload()

  const uploadFile = async (file: File) => {
    const uploadData = [file]
    const uris = await upload({ data: uploadData })
    return uris
  }

  const setSelectedElection = (data: Election) => {
    console.log(data)
    setSelectedElectionData(data)
  }

  const getElectionCandidate = (electionID: any) => {
    allElectionList?.forEach((election: any, index: number) => {
      const { hash, candidates } = election
      if (index === electionID) {
        setSelectedElectionCandidate(candidates)
      }
    })
  }

  const { mutateAsync: giveVote, isLoading } = useContractWrite(
    contract,
    'giveVote'
  )

  const giveVoteCall = async (
    _electionId: number,
    _voterHash: any,
    _candidateHash: any
  ) => {
    setIsGivingVoteProcessLoading(true)
    try {
      await giveVote({
        args: [_electionId, _voterHash, _candidateHash, Date.now()],
      })
      setVoteCountStatus(true)
      setIsGivingVoteProcessLoading(false)
    } catch (err) {
      setVoteCountStatus(false)
      setIsGivingVoteProcessLoading(false)
    }
  }

  return (
    <AuthorityContext.Provider
      value={{
        previousElection,
        onGoingElection,
        upComingElection,
        isElectionListLoading,
        isBallotInitialized,
        isBallotLoading,
        initializeBallot,
        isVoterRegistered,
        registerVoterCall,
        isVoterRegistrationLoading,
        isVoterEmailSent,
        setIsVoterEmailSent,
        registerCandidateCall,
        isCandidateRegistrationLoading,
        isCandidateRegistered,
        setSelectedElection,
        selectedElectionData,
        getElectionCandidate,
        selectedElectionCandidate,
        giveVoteCall,
        voteCountStatus,
        setVoteCountStatus,
        isGivingVoteProcessLoading,
      }}
    >
      {children}
    </AuthorityContext.Provider>
  )
}

export default AuthorityContextProvider
