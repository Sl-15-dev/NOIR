// Layout uses the media column's actual width, not the viewport or the NOIR shell.
export function collectionLayout(items,width) {
  const columns=width>=540?4:2;
  const margin=width>=540?22:12;
  const slot=(width-margin*2)/columns;
  const scale=Math.min(.86,(slot-14)/Math.max(160,...items.map(b=>b.dimensions.width)));
  let rowY=34;
  const positions=new Map();
  for(let start=0;start<items.length;start+=columns){
    const row=items.slice(start,start+columns);
    // Center incomplete rows, with small irregularities to keep the collection personal.
    const rowLeft=(width-slot*row.length)/2;
    let bottom=rowY;
    row.forEach((badge,index)=>{
      const n=start+index,strap=90+n%3*19;
      const y=rowY+[0,9,3,12][n%4];
      positions.set(badge.id,{x:rowLeft+slot*(index+.5)-80+[2,-3,4,-2][n%4],y,angle:[-2,2.5,-1.5,1][n%4],strap,scale});
      bottom=Math.max(bottom,y+(strap+badge.dimensions.height+24)*scale);
    });
    rowY=bottom+25;
  }
  return {width,height:Math.max(340,rowY+104),columns,positions};
}
