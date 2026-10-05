export default function Poster({chapter,priority=false}:{chapter:string;priority?:boolean}){
 return <picture><source media="(max-width:760px),(max-aspect-ratio:85/100)" srcSet={`/narrative/${chapter}-portrait.webp`}/><img src={`/narrative/${chapter}-desktop.webp`} alt="" width={1440} height={1000} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'low'}/></picture>;
}
