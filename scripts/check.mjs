import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for(const directory of ['dist','scripts'])for(const file of readdirSync(directory,{recursive:true}).filter(f=>/\.(m?js)$/.test(f))){
  const result=spawnSync(process.execPath,['--check',`${directory}/${file}`],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);
}
console.log('All application and server JavaScript parsed successfully.');
