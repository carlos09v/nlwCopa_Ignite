import { useEffect, useState } from 'react';
import { useToast, FlatList } from 'native-base';

import { api } from '../services/api';

import { Game, GameProps } from '../components/Game'
import Loading from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';

interface Props {
  poolId: string;
  code: string
}

export function Guesses({ poolId, code }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [games, setGames] = useState<GameProps[]>([])
  const [ firstTeamPoints, setFirstTeamPoints ] = useState('')
  const [ secondTeamPoint, setSecondTeamPoint ] = useState('')
  const toast = useToast()

  // Pegar os Games do bolão
  async function fetchGames() {
    try {
      setIsLoading(true)

      const res = await api.get(`/pools/${poolId}/games`)
      setGames(res.data.games)
    }catch (err) {
      console.log(err)

      toast.show({
          title: 'Não foi possivel carregar os jogos',
          placement: 'top',
          bgColor: 'red.500'
      })
    }finally{
      setIsLoading(false)
    }
  }

  // Enviar palpites
  async function handleGuessConfirm(gameId: string) {
    try{
      if(!firstTeamPoints.trim() || !secondTeamPoint.trim()) {
        return toast.show({
          title: 'Informe o placar do palpite.',
          placement: 'top',
          bgColor: 'red.500'
        })
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoint: Number(secondTeamPoint)
      })

      toast.show({
        title: 'Palpite realizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500'
      })

      fetchGames()
    }catch (err) {
      console.log(err)

      toast.show({
        title: 'Não foi possivel enviar o palpite.',
        placement: 'top',
        bgColor: 'red.500'
      })
    }
  }

  useEffect(() => {
    fetchGames()
  }, [poolId])

  if(isLoading) {
    <Loading />
  }

  return (
    <FlatList 
      data={games}
      keyExtractor={item => item.id}
      renderItem={( { item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoint}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
      _contentContainerStyle={{ pb: 10 }}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
    />
  );
}
