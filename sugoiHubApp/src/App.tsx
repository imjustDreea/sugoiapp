import "./index.css";
import "./App.css";

function App() {

  return (
    <>
     
<div className="grid grid-cols-5 grid-rows-5 gap-4 bg-b">
    <div className="col-span-3 row-span-5">1</div>
    <div className="col-span-2 col-start-4">2</div>
    <div className="col-span-2 row-span-4 col-start-4 row-start-2">3</div>
</div>
    
   
    </>
  )
}

export default App
