import React, { useState } from 'react';
import LeftBar from '../LeftBar/LeftBar';

import './Main.css';

const handleWidth = 10;
const isMainStartHandle = 'main-start-handle';
const isMainEndHandle = 'main-end-handle';
const trackId = 'track-id';
const chipId = 'chip-id';

const createId = (function (params) {
  let id = 0;
  return ()=>{
    id+=1;
    return id;
  }
})();

const initTracks = [
  {
    id: createId(),
    chips: [{
      start: 0,
      width: 10,
      color: 'pink',
      id: createId(),
    }, {
      start: 30,
      width: 10,
      color: 'red',
      id: createId(),
    }, {
      start: 90,
      width: 10,
      color: 'red',
      id: createId(),
    }]
  },
  {
    id: createId(),
    chips: [{
      start: 30,
      width: 10,
      color: 'blue',
      id: createId(),
    }]
  },
  {
    id: createId(),
    chips: [{
      start: 40,
      width: 40,
      color: '#be70d6',
      id: createId(),
    }]
  }
]

//最好的方式应该是适用 left 和 right而不是适用百分比，百分比有小数精度问题
const Main = ()=>{
  const [isChangeSizing, setIsChangeSizing] = useState(false);
  const [changingSizingInfo, setChangingSizingInfo] = useState();

  const [tracks, setTrack] = useState(initTracks);

  const moveChip = (chipId, originTrackId, targetTrackId, newChip, tracks) =>{
    //多次寻找性能可以优化
    return tracks.map((track, i)=>{
      if(originTrackId && track.id === +originTrackId){
        //-
        const chipIndex = track.chips.findIndex((c)=>c.id === +chipId);
        const newChips = [...track.chips];
        newChips.splice(chipIndex, 1)
        return {
          ...track,
          chips: newChips,
        }
      }
      if(track.id === +targetTrackId){
        //+
        let chip = newChip;
        if(!newChip) {
          tracks.find((v)=>{
            return v.id === +originTrackId? v.chips.find(c=>{
              if(c.id === +chipId){
                chip = c;
              }
              return c.id === +chipId;
            }): false
          });
        }
        return {
          ...track,
          chips:  [...track.chips, chip],
        }
      } 
      return track
    })
    
  }

  const chipStartOnMouseDown = (event)=>{
    const isActionMainStartHandle = !!+event.target.getAttribute(isMainStartHandle) ;
    const isActionMainEndHandle = !!+event.target.getAttribute(isMainEndHandle) ;

    if(isActionMainStartHandle || isActionMainEndHandle){
      const currTrackId = event.target.getAttribute(trackId) ;
      const currChipId = event.target.getAttribute(chipId) ;
      setIsChangeSizing(true);
      //为以后代理做扩展
      const $currChip = document.querySelector(`*[is-chip="1"][${trackId}="${currTrackId}"][${chipId}="${currChipId}"]`);
      setChangingSizingInfo({
        trackId: currTrackId,
        chipId: currChipId,
        handleDirection: isActionMainStartHandle? 'start': 'end',
        // originData: tracks.find((v)=>v.id === currChipId? v.chips.find(c=>c.id === currChipId): false),
        x: $currChip.getBoundingClientRect().x,
        right: $currChip.getBoundingClientRect().right,
      })
    }
   
  }

  const chipStartOnMouseMove = (event)=>{
    //性能优化的地方 查找 dom 与原生动画而不是 state 驱动
    if(isChangeSizing){
      const { handleDirection, trackId: currTrackId, chipId: currChipId, x, right } = changingSizingInfo;
      if(handleDirection === 'start') {
        const $currSizingChipEndHandle = document.querySelector(`*[${isMainEndHandle}="1"][${trackId}="${currTrackId}"][${chipId}="${currChipId}"]`);
        if(event.pageX > $currSizingChipEndHandle.getBoundingClientRect().x - handleWidth){
          //遇到了 end
          return
        }else {
          //可优化为缓存 dom
          const $currTrack = document.querySelector(`*[is-track="1"][${trackId}="${currTrackId}"]`);
          const currTrackClientRect = $currTrack.getBoundingClientRect();
          const nextWidthPerent = (right - event.pageX + handleWidth) / currTrackClientRect.width;
          debugger
          const nextStartPercent = (event.pageX - currTrackClientRect.x) / currTrackClientRect.width; 
          const newTracks = tracks.map((t)=>{
            if(t.id === +currTrackId){
              return {
                ...t,
                chips: t.chips.map((c)=>{
                  if(c.id === +currChipId){
                    return {
                      ...c,
                      start: nextStartPercent * 100,
                      width: nextWidthPerent * 100,
                    }
                  } 
                  return c
                })
              }
            }
            return t
          });
          setTrack(newTracks)
        }
        return
      }
      if(handleDirection === 'end'){
        if(event.pageX - handleWidth <= x + handleWidth){
          return
        }else {
          const $currTrack = document.querySelector(`*[is-track="1"][${trackId}="${currTrackId}"]`);
          const currTrackClientRect = $currTrack.getBoundingClientRect();
          const nextWidth = (event.pageX - x) / currTrackClientRect.width;
          console.log(event.pageX, x, currTrackClientRect.width);
          const newTracks = tracks.map((t)=>{
            if(t.id === +currTrackId){
              return {
                ...t,
                chips: t.chips.map((c)=>{
                  if(c.id === +currChipId){
                    return {
                      ...c,
                      width: nextWidth * 100,
                    }
                  } 
                  return c
                })
              }
            }
            return t
          });
          setTrack(newTracks)
        }
      }
    }
  }
  
  const chipStartOnMouseUp = ()=>{
    setIsChangeSizing(false);
    setChangingSizingInfo(undefined);
  }

  const chipStartOnMouseLeave = ()=>{
    setIsChangeSizing(false);
    setChangingSizingInfo(undefined);
  }

  const onDragStart = (event, trackId, chipId) => {
    event.dataTransfer.setData('dragInfo', JSON.stringify({ originTrackId: trackId, originChipId: chipId }));
  }
  
  const onLeftBarDragStart = (event, chip) => {
    event.dataTransfer.setData('dragInfo', JSON.stringify({ newChip: { ...chip, id: createId() } }));
  }
   
  const onDrop = (event, dropIndex) => {
    const { originTrackId, originChipId, newChip } = JSON.parse(event.dataTransfer.getData('dragInfo'));
    //dom可以缓存
    const isInDropZoneGap = event.target.getAttribute('drop-zone-gap');
    const isInDropZoneTrack = event.target.getAttribute('drop-zone-track');
    const trackId = event.target.getAttribute('track-id');
    if(isInDropZoneGap || isInDropZoneTrack) {
      if(isInDropZoneGap){
        const insertPosition = event.target.getAttribute('insert-position');
        const trackIndex = tracks.findIndex(t=>t.id === +trackId);
        const newId = createId();
        let newTrack = [...tracks];
        newTrack.splice(insertPosition === 'before'? trackIndex: trackIndex + 1, 0, {
          id: newId,
          chips: []
        });
        newTrack = moveChip(originChipId, originTrackId, newId, newChip, newTrack)
        setTrack(newTrack);
        return 
      }
      
      if(isInDropZoneTrack){
        const newTrack = moveChip(originChipId, originTrackId, trackId, newChip, tracks);
        setTrack(newTrack)
      }
    } 
  }
  
  return <div className='main-block'>
    <LeftBar onLeftBarDragStart={onLeftBarDragStart}></LeftBar>
    <div className='main-panel'>
      <div 
        className='main-panel-gap-tb' 
        main-panel-gap-top='1' 
        drop-zone-gap='1' 
        onDragOver={(event)=>event.preventDefault()}
        insert-position='before'
        track-id={tracks[0].id}
        onDrop={onDrop}></div>
      {
        tracks.map((track, index, arr)=>{
          return <div className='main-track-wraper' key={track.id}>
            { index === 0? null: <div 
              className='main-gap' 
              drop-zone-gap='1' 
              insert-position='before'
              track-id={track.id} 
              onDragOver={(event)=>event.preventDefault()} 
              onDrop={onDrop}></div>}
            <div 
              className='main-track'
              onMouseDown={(event)=>chipStartOnMouseDown(event, track.id)}
              onMouseUp={(event)=>chipStartOnMouseUp(event, track.id)}
              onMouseMove={(event)=>chipStartOnMouseMove(event, track.id)}
              onMouseLeave={(event)=>chipStartOnMouseLeave(event, track.id)}
              track-id={track.id}
              drop-zone-track='1'
              is-track='1'
              onDragOver={(event)=>event.preventDefault()} 
              onDrop={onDrop}
            >
              {
                track.chips.map((chip)=>{
                  return <div 
                    className='main-chip' 
                    style={{ background: chip.color, left: chip.start+'%', width: chip.width+'%' }} 
                    key={chip.id} 
                  >
                    <div 
                      className='main-start-handle' 
                      style={{ width: handleWidth+'px' }}
                      {...{
                        [isMainStartHandle]:'1',
                        [trackId]:track.id,
                        [chipId]:chip.id,
                      }}
                    ></div>
                    <div className='main-content' track-id={track.id}
                    chip-id={chip.id}
                    is-chip='1'
                    draggable="true"
                    onDragStart={event => onDragStart(event, track.id, chip.id)}></div>
                    <div 
                      className='main-end-handle' 
                      style={{ width: handleWidth+'px' }}
                      {...{
                        [isMainEndHandle]:'1',
                        [trackId]:track.id,
                        [chipId]:chip.id,
                      }}
                    ></div>
                  </div>
                })
              }
            </div>
            { 
              index === arr.length -1? null: <div 
                className='main-gap' 
                insert-position='after'
                drop-zone-gap='1' 
                track-id={track.id} 
                onDragOver={(event)=>event.preventDefault()}
                onDrop={onDrop}>
              </div>
            }
          </div>
        })
      }
      <div 
        className='main-panel-gap-tb' 
        main-panel-gap-bottom='1' 
        drop-zone-gap='1' 
        insert-position='after'
        track-id={tracks[tracks.length-1].id}
        onDragOver={(event)=>event.preventDefault()}
        onDrop={onDrop}></div>
    </div>
  </div>
}
export default Main