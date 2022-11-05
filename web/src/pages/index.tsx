interface HomeProps {
  poolCount: number;
  guessCount: number;
  userCount: number;
}

import { FormEvent, useState } from 'react';
import { api } from '../lib/axios';

import Image from 'next/image'
import appPreviewImg from '../assets/app-nlwCopa-preview.png'
import logoImg from '../assets/logo.svg'
import usersAvatarImg from '../assets/users-avatar.png'
import iconCheckImg from '../assets/icon-check.svg'

export default function Home(props: HomeProps) {
  // State - Variação do valor em tempo real
  const [poolTitle, setPoolTitle] = useState('')
  
  const  createPool = async (e: FormEvent) => {
    e.preventDefault()

    // poolTitle
    try {
      const res = await api.post('/pools', {
        title: poolTitle
      })

      const { code } = res.data

      await navigator.clipboard.writeText(code)
      alert('Bolão criado com sucesso! O Código foi copiado pra área de transferencia !')
      setPoolTitle('')
    }catch (err) {
      console.log(err)
      alert('Falha ao criar o bolão')
    }
  }
  
  // Styles usando tailwind por meio de classes
  return (
    <div className='max-w-[1124px] h-screen mx-auto grid grid-cols-2 items-center gap-28'>
      <main>
        <Image src={logoImg} alt='Logo NLW Copa' />

        <h1 className='mt-14 text-white text-5xl font-bold leading-tight'>Crie o seu próprio bolão da copa e compartilhe entre amigos!</h1>

        <div className='mt-10 flex items-center gap-2'>
          <Image src={usersAvatarImg} alt='' />

          <strong className='text-gray-100 text-xl'>
            <span className='text-ignite-500'>+{props.userCount}</span> pessoas já estão usando
          </strong>
        </div>

      <form onSubmit={createPool} className='mt-10 flex gap-2'>
        <input className='flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100' type="text" required placeholder='Qual nome do seu bolão?' onChange={e => setPoolTitle(e.target.value)} value={poolTitle} />
        <button className='bg-yellow-500 px-6 py-4 rounded font-bold text-gray-900 text-sm hover:bg-yellow-700' type="submit">Criar meu bolão</button>
      </form>

      <p className='text-gray-300 mt-4 text-sm leading-relaxed'>Após criar seu bolão, você receberá um código único que poderá usar para convidar outras pessoas 🚀</p>

      <div className='mt-10 pt-10 border-t border-gray-600 flex items-center justify-between text-gray-100'>
        <div className='flex items-center gap-6'>
          <Image src={iconCheckImg} alt="" />
          <div className='flex flex-col'>
            <span className='font-bold text-2xl'>+{props.poolCount}</span>
            <span>Bolões criados</span>
          </div>
        </div>

        <div className='w-px h-14 bg-gray-600'></div>

        <div className='flex items-center gap-6'>
          <Image src={iconCheckImg} alt="" />
          <div className='flex flex-col'>
            <span className='font-bold text-2xl'>+{props.guessCount}</span>
            <span>Palpites enviados</span>
          </div>
        </div>
      </div>
      </main>


      <Image src={appPreviewImg} alt="Dois celulares exibindo uma prévia da aplicação móvel do NLW Copa" quality={100} />
    </div>
  )
}


export const getServerSideProps = async () => {
  // SSR - Server-side-redering

  // Executar chamadas paralelamente e ñ sequencialmente utilizando axios
  // getStaticProps Function !!!
  const [poolCountResponse, guessCountResponse, userCountResponse] = await Promise.all([
    api.get('pools/count'),
    api.get('guesses/count'),
    api.get('users/count')
  ])
  

  return {
    props: {
      poolCount: poolCountResponse.data.count,
      guessCount: guessCountResponse.data.count,
      userCount: userCountResponse.data.count
    }
  }
}