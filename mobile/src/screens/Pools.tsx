import { useCallback, useState } from "react"
import { VStack, Icon, useToast, FlatList } from "native-base"
import { Octicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'

import Button from "../components/Button"
import { Header } from "../components/Header"
import { PoolCard, PoolCardProps } from '../components/PoolCard'
import { EmptyPoolList } from "../components/EmptyPoolList"
import Loading from '../components/Loading'

import { api } from '../services/api'


const Pools = () => {
  const [isLoading, setIsLoanding] = useState(true)
  const [pools, setPools] = useState<PoolCardProps[]>([])
  const { navigate } = useNavigation()
  const toast = useToast()

  // Pegar os bolões
  async function fetchPools(){
    try {
      const res = await api.get('/pools')
      setIsLoanding(true)

      setPools(res.data.pools)
    } catch(err) {
      console.log(err)

      toast.show({
        title: 'Não foi possivel carregar os bolões',
        placement: 'top',
        bgColor: 'red.500'
      })
    }finally {
      setIsLoanding(false)
    }
  }

  // Recarregar Pools List
  useFocusEffect(useCallback(() => {
    fetchPools()
  },[]))

  return (
    <VStack flex={1} bgColor='gray.900'>
        <Header title="Meus bolões" />

        <VStack mt={6} mx={5} borderBottomWidth={1} borderBottomColor='gray.600' pb={4} mb={4}>
            <Button title="BUSCAR BOLÃO POR CÓDIGO" leftIcon={<Icon as={Octicons} name='search' color='black' size='md' />} onPress={() => navigate('find')} />
        </VStack>

        {
          isLoading ? <Loading /> :
          <FlatList
            data={pools}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <PoolCard 
                data={item}
                 onPress={() => navigate('details', { id: item.id })}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => <EmptyPoolList />}
            _contentContainerStyle={{ pb: 10 }}
            px={5}
          />
        }
    </VStack>

  )
}

export default Pools