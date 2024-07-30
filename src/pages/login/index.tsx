import { useEffect } from 'react'
import logoImg from '../../assets/logo.svg'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../../components/container'
import { Input } from '../../components/input'

import {useForm} from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../service/firabase'

import toast  from 'react-hot-toast'




const schema = z.object({
  email: z.string().email("Insira um email válido").nonempty("o campoe e-mail é obrigatório"),
  password: z.string().nonempty("Senha obrigatória")
})

type FormData = z.infer<typeof schema>


export function Login(){
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors} } = useForm<FormData>({
      resolver:zodResolver(schema),
      mode:"onChange"
    })

    useEffect(() =>{
      async function handleLogout(){
        await signOut(auth)
      }
      handleLogout();
    },[])

    function onsubmit (data:FormData){
      signInWithEmailAndPassword(auth, data.email, data.password)
      .then((user) =>{
        console.log("logado")
        console.log(user)
        toast.success("Logado c/ sucesso")
        navigate ("/dashboard", {replace:true})
      })
      .catch(err =>{
        console.log("error")
        console.log(err);
        toast.error("Erro ao fazer o login!")
      })
    }

    return(
      <Container>
        <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
          <Link to="/" className='mb-6 max-w-smw-full'>
            <img 
            src={logoImg}
            alt='Logo site'
            className='w-full'
            />
          </Link>

          <form className='bg-white max-w-xl w-full rounded-lg p-4'
            onSubmit={handleSubmit(onsubmit)}
          >
            <div className='mb-3'>
            <Input
              type="email"
              placeholder='Digite seu email'
              name='email'
              error={errors.email?.message}
              register={register}
            />
            </div>
            <div className='mb-3'>
            <Input
              type="password"
              placeholder='Digite sua senha'
              name='password'
              error={errors.password?.message}
              register={register}
            />
            </div>

            <button 
            type='submit'
            className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium'>
              Acessar
            </button>
          </form>
          <Link to="/register">
            <p>Ainda não possui uma conta? Cadastre-se! </p>
          </Link>
        </div>
      </Container>
    )
  }
  