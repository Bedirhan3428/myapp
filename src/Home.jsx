import React from 'react'


function Home() {
  const [puan, setPuan] = React.useState('')

  const [inputValue, setInputValue] = React.useState('')
  const [a, setA] = React.useState(0)
  const [b, setB] = React.useState(0)
  const [c, setC] = React.useState(0)
  const [onayla1 , setOnayla1] = React.useState(false)
  const [dg, setDg] = React.useState(false)
  const [input1, setInput1] = React.useState(false)
  const [typeNumber1 , setTypeNumber1 ] = React.useState('')
  const [cevp, setCevp] = React.useState('')
  const [cevapg1, setCevapg1] = React.useState(true)

  

  const handleChange = (e) => {
    setInputValue(e.target.value)
  }

  const typeNumber = (e) => {
    setTypeNumber1(e.target.value)

  }

  const cevap = () => {
    setCevp("Doğru")
    setCevapg1(false)
  }

  const yns = () => {
    setCevp("Yanlış")
    setCevapg1(false)
  
  }

 const Random = () => {

 

  const max = 10
  const min = -10
  const a = Math.floor(Math.random() * (max - min + 1)) + min
  const b = Math.floor(Math.random() * (max - min + 1)) + min
  const c = Math.floor(Math.random() * (max - min + 1)) + min
  setA(a)
  setB(b)
  setC(c)
  setOnayla1(true)
  setDg(true)
  setInput1(true)
}

 

  
  
console.log(b*b-4*a*c)

const deltaCevap = () =>{
  if(b*b-4*a*c == inputValue){
    setPuan("Doğru")
  }else{
    setPuan("Yanlış")
  }
  setOnayla1(false)
  setInputValue('')
}


  

  return (
    <div>
     
      <p>Delta, bir denklemdeki köklerin varlığını ve sayısını belirlemek için kullanılır. İkinci dereceden bir denklemin diskriminantı olan Delta (Δ), b² - 4ac formülüyle hesaplanır. Eğer Delta sıfırdan büyükse (Δ > 0), bu durum denklemin iki farklı ve gerçek kökü olduğu anlamına gelir. Delta pozitif olduğunda, köklerin belirgin farklılıklar gösterdiği ve iki ayrı noktada kesişim sağladığı görülür. Bu durumda, parabol grafik ekseni iki kez keser ve iki reel sayı çözümü elde edilir. Delta'nın pozitif değeri, çözüm kümelerinin çeşitliliğini ve denklemdeki belirsizliklerin çözülmesini sağlar.</p>
    <p> -b ± √Δ <br /> x = ------------------ <br /> 2a</p>
   
      <hr />
   <p className='soru'> {a}x^2 + {b}x + {c} = 0 </p>
    
      
      
      
      <hr />
      <button onClick={Random} className='sorugetir'>Soru Getir</button>
      
   {dg &&<p>Deltayı giriniz.</p>} 
    {input1 && <input type="text" value={inputValue} onChange={handleChange} placeholder='Bir değer girirniz.' className='inpot'/>}
     <hr />
    {onayla1 && <button onClick={deltaCevap} className='onayla'>Onayla</button>} <h1>{puan}</h1>

    <h1>Soru</h1>
    <p>Aşağdaki denklemin d.ç.k sı nedir.</p>
    <p>2x^2 + -3x - 2 = 0</p>
    

   {cevapg1 && <button className='ona' onClick={cevap} >x₁ = 2 <br /> x₂ = -1/2</button>}  
    
   {cevapg1 &&  <button className='ona' onClick={yns}>x₁ = 5 <br /> x₂ = 7</button>}
    
    {cevapg1 &&  <button className='ona' onClick={yns}>x₁ = 2/3 <br /> x₂ = 1/3</button>}

    {cevapg1 && <button className='ona' onClick={yns}>x₁ = 1/2 <br /> x₂ = 3</button>}
  <h1>{cevp}</h1> 
  
  
       
      


          
      
      
     




    </div>
  )
}

export default Home
