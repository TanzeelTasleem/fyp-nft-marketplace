import React, { FC, useEffect, useState } from 'react';

const Timer: FC<{ endingTime: number /* milis */, onTimeOver?: () => void }> = ({ endingTime, onTimeOver }) => {
   const [distance, setDistance] = useState(endingTime - Date.now());
   const [isTImeOver, setTimeOver] = useState(false);
   // const sec = endingTime / 1000;
   // const min = sec / 60;
   // const hour = min / 60;

   // Find the distance between now and the count down date
   // const distance = endingTime - Date.now();

   // Time calculations for days, hours, minutes and seconds
   const days = Math.floor(distance / (1000 * 60 * 60 * 24));
   const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
   const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((distance % (1000 * 60)) / 1000);

   useEffect(() => {
      const x = setInterval(() => {
         const _distance = endingTime - Date.now();
         setDistance(_distance);
         if (_distance < 0) {
            clearInterval(x);
         }

      }, 1000)


      return () => { clearInterval(x) }
   }, [])


   useEffect(() => {
      if (distance < 0) {
         setTimeOver(true);
         onTimeOver && onTimeOver()
      }
   }, [distance])

   return (
      <div className='flex p-2' >
         {/* {days > 1 && <div>{formatTo2digit(days)} : </div>}
         {hours > 1 && <div>{formatTo2digit(hours)} : </div>}
         <div>{formatTo2digit(minutes)} : </div>
         <div>{formatTo2digit(seconds)} </div>
         <div>Left 🔥</div> */}
         {!isTImeOver ?
            <div>
               {days > 1 && `${formatTo2digit(days)} : `}
               {hours > 1 && `${formatTo2digit(hours)} : `}
               {`${formatTo2digit(minutes)} : `}
               {formatTo2digit(seconds)}
               <span className='ml-2' >Left 🔥</span>
            </div> :
            <div>Auction completed</div>
         }
      </div>
   )
}

export default Timer;

const formatTo2digit = (val: number) => {
   let _val = val.toFixed();
   if (_val.length < 2) { _val = "0" + _val };
   return _val;
}