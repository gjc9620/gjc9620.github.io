import './LeftBar.css';

const blocks = [{
  color: 'pink',
}, {
  color: 'cornflowerblue',
},{
  color: 'aqua',
}];


const LeftBar = ()=>{
  return <div className='left-bar'>
    {
      blocks.map((v)=>{
        return <div style={{background: v.color}} className='left-bar-chip'></div>
      })
    }
    
  </div>
}
export default LeftBar