import { ChangeEvent, useState, useContext } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelheader";

import { FiUpload, FiTrash } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../../context/AuthContext";
import { v4 as uuidV4} from 'uuid'
import { storage, db } from "../../../service/firabase";
import { ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage'
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";


const schema = z.object({
  name: z.string().nonempty("O campo é obrigatório"),
  model: z.string().nonempty("O modelo é obrigatório"),
  year: z.string().nonempty("O ano do carro é obrigatório"),
  km: z.string().nonempty("O km é obrigatório"),
  price: z.string().nonempty("O preço é obrigatório"),
  city: z.string().nonempty("A cidade pe obrigatporia"),
  whatsapp: z
    .string()
    .min(1, "O telefone é obrigatório")
    .refine((value) => /^(\d{10,11})$/.test(value), {
      message: "Número invalido",
    }),
  description: z.string().nonempty("A descrição é obrigatória"),
});

type FormData = z.infer<typeof schema>;

export function New() {
  const {user} = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  
  const [carImages, setCarImages] = useState <ImageItemProps[]>([])

  interface ImageItemProps{
    uid:string;
    name:string;
    previewUrl:string;
    url:string;
  }

  function onSubmit(data: FormData) {
    if(carImages.length === 0){
      toast.error("Insira uma imagem")
      return;
    }
    const carListImages = carImages.map( car => {
      return{
        uid: car.uid,
        name: car.name,
        url: car.url
      }
    })

    addDoc(collection(db, "cars"),{
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid:user?.uid,
      images: carListImages,
    })
    .then(() =>{
      reset();
      setCarImages([]);
      console.log("Cadastrado")
      toast.success("Carro cadastrado com sucesso")
    })
    .catch((error) =>{
      console.log(error)
      console.log("erro ao cadastrar")
    })


    console.log(data);
  }
  
  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0]
      
      if(image.type === 'image/jpeg' || image.type === 'image/png'){
        //enviar para o banco
       await handleUpload(image)
      }else{
        alert("Enviar imagem em formato png/jpeg")
        return;
      }
    }
  }

  async function handleUpload(image:File) {
    if(!user?.uid){
      return;
    }
    const currentUid = user?.uid;
    const uidImage = uuidV4();
    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)
    uploadBytes(uploadRef, image)
    .then((snapshot)=>{
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        }
        setCarImages((images) => [...images, imageItem])
      })
    })

  }

  async function handleDelete(item:ImageItemProps){
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);
    try{
      await deleteObject(imageRef)
      setCarImages(carImages.filter((car) => car.url !== item.url))
    }catch(err){
      console.log("Erro ao deletar")
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-42 rounded-lg flex items-center justify-center cursor-pointer border-gray-400 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImages.map( item => (
          <div key={item.name}  className="w-full h-32 flex items-center justify-center relative">
            <button className="absolute" onClick={() => handleDelete(item)}>
              <FiTrash size={28} color="#FFF"/>
            </button>
            <img
              src={item.previewUrl}
              className="rounded-lg w-full h-32 object-cover"
              alt="Foto do carro"
            />
          </div>
        ))}
      </div>
      <div className=" w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome Carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Onix 1.0..."
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Preço do carro</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: R$ 55.000..."
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo Carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: Flex, cambio manual, 1.0..."
            />
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano Carro</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2010"
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">KM do Carro</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 178.990km"
              />
            </div>
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / WhatsApp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: (DDD) 99999-9999"
              />
            </div>  
            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Brasília - DF"
              />
            </div>          
          </div>
          <div className="mb-3">
              <p className="mb-2 font-medium">Descrição</p>
              <textarea
                className="border-2 w-full rounded-lg h-24 px-2"
                {...register("description")}
                name="description"
                id="description"
                placeholder="Digite a descrição do seu carro..."
              />
              {errors.description && <p className="mb-1 text-red-400">{errors.description.message}</p>}
            </div>
            <button type="submit" className=" w-full rounded-md bg-zinc-900 text-white font-medium h-10">
              Cadastrar
            </button>
              
            
        </form>
      </div>
    </Container>
  );
}
