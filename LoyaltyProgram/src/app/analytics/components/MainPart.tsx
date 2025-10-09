import { useEffect, useRef, useState } from "react";
import BottomPart from "./BottomPart";
import MainContent from "./Content";

const MainPart = () => {
     const scrollRef = useRef<HTMLDivElement>(null);
      const [isDown, setIsDown] = useState(false);
      const [startX, setStartX] = useState(0);
      const [scrollLeft, setScrollLeft] = useState(0);
       const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

   
    return(
      <div ref={scrollRef}
             className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing"
             onMouseDown={handleMouseDown}
             onMouseLeave={handleMouseLeave}
             onMouseUp={handleMouseUp}
             onMouseMove={handleMouseMove}
           >
             <div className="flex gap-2 sm:gap-6 min-w-max justify-center">
              <MainContent/>
           
         </div>
         </div>
    )
}

export default MainPart;