import './LeftBar.css';

const blocks = [{
  start: 0,
  width: 10,
  color: 'pink',
}, {
  start: 10,
  width: 30,
  color: 'cornflowerblue',
},{
  start: 50,
  width: 30,
  color: 'aqua',
}];


const LeftBar = ({ onLeftBarDragStart })=>{
  return <div className='left-bar'>
    {
      blocks.map((chip)=>{
        return <div 
          style={{background: chip.color}} 
          className='left-bar-chip'
          draggable="true"
          onDragStart={(event)=>{
            onLeftBarDragStart(event, chip)
          }}
        >

        </div>
      })
    }
    
  </div>
}
export default LeftBar