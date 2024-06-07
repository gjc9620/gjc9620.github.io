import React, { useState } from 'react';
import LeftBar from '../LeftBar/LeftBar';

import './Main.css';


const handleWidth = 10;
const chipMinWidth = handleWidth * 2;
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

//最好的方式应该是适用 left 和 right而不是适用百分比，百分比有小数精度问题
const Main = ()=>{
  const [isChangeSizing, setIsChangeSizing] = useState(false);
  const [changingSizingInfo, setChangingSizingInfo] = useState();

  const [tracks, setTrack] = useState([
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
    }
  ]);

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
        originData: tracks.find((v)=>v.id === currChipId? v.chips.find(c=>c.id === currChipId): false),
        x: $currChip.getBoundingClientRect().x,
        right: $currChip.getBoundingClientRect().right,
      })
    }
   
  }

  const chipStartOnMouseMove = (event)=>{
    //性能优化的地方 查找 dom 与原生动画而不是 state 驱动
    if(isChangeSizing){
      const { handleDirection, trackId: currTrackId, chipId: currChipId, originData, x, right } = changingSizingInfo;
      if(handleDirection === 'start') {
        const $currSizingChipEndHandle = document.querySelector(`*[${isMainEndHandle}="1"][${trackId}="${currTrackId}"][${chipId}="${currChipId}"]`);
        if(event.pageX > $currSizingChipEndHandle.getBoundingClientRect().x - handleWidth){
          //遇到了 end
          return
        }else {
          //可优化为缓存 dom
          const $currTrack = document.querySelector(`*[is-track="1"][${trackId}="${currTrackId}"]`);
          const currTrackClientRect = $currTrack.getBoundingClientRect();
          const nextWidthPerent = (right - event.pageX) / currTrackClientRect.width;
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
        const $currSizingChipEndHandle = document.querySelector(`*[${isMainEndHandle}="1"][${trackId}="${currTrackId}"][${chipId}="${currChipId}"]`);
        if(event.pageX < x + handleWidth){
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
  
  return <div className='main-block'>
    <LeftBar></LeftBar>
    <div className='main-panel'>
      {
        tracks.map((track, index, arr)=>{
          return <div className='main-track-wraper' key={track.id}>
            { index === 0? <div className='main-gap'></div>: null}
            <div 
              className='main-track'
              onMouseDown={(event)=>chipStartOnMouseDown(event, track.id)}
              onMouseUp={(event)=>chipStartOnMouseUp(event, track.id)}
              onMouseMove={(event)=>chipStartOnMouseMove(event, track.id)}
              onMouseLeave={(event)=>chipStartOnMouseLeave(event, track.id)}
              track-id={track.id}
              is-track='1'
            >
              {
                track.chips.map((chip)=>{
                  return <div 
                    className='main-chip' 
                    style={{ background: chip.color, left: chip.start+'%', width: chip.width+'%' }} 
                    key={chip.id}
                    track-id={track.id}
                    chip-id={chip.id}
                    is-chip='1'
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
            { index === arr.length -1? null: <div className='main-gap'></div>}
          </div>
        })
      }
    </div>
  </div>
}
export default Main