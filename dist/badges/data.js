// Replace these sample memories with your own. Positions are corkboard coordinates.
// badgeImage: optional local image URL; photos: [{src, alt, caption}].
export const badges = [
  {
    id:'openai',dateISO:'2025-10-06', eventName:'OpenAI DevDay', organization:'OpenAI', category:'Technology', year:2025,
    date:'October 6, 2025', location:'San Francisco, CA', role:'Attendee',
    lanyardColor:'#38684c', ink:'#193c2a', paper:'#f1f0dc', design:'openai', mark:'◎', label:'DEV DAY',
    shortDescription:'A room full of people asking what comes next. I left with a notebook full of possibilities.',
    fullStory:'I came to explore the latest APIs and model releases, and stayed for the conversations between sessions. A hallway demo became a long conversation about agents, useful tools, and making ambitious ideas feel a little more possible. The best thing I brought home wasn’t a feature announcement — it was a new group of people to build with.',
    takeaway:'Build something small. Share it before you feel ready.', badgeImage:null, photos:[]
  },
  {
    id:'config',dateISO:'2025-05-06', eventName:'Config', organization:'Figma', category:'Conferences', year:2025,
    date:'May 6–8, 2025', location:'San Francisco, CA', role:'Attendee',
    lanyardColor:'#f35b2f', ink:'#27221f', paper:'#ff714a', design:'config', mark:'✳', label:'config',
    shortDescription:'Three days of little details, big ideas, and remembering why I love making things.',
    fullStory:'From the opening talk to impromptu portfolio reviews, Config reminded me that great work is as much about curiosity as craft. I spent an afternoon comparing notes with designers who cared deeply about the same tiny interactions I did. My sketchbook came home considerably heavier.',
    takeaway:'The smallest details often carry the most personality.', badgeImage:null, photos:[]
  },
  {
    id:'ethglobal',dateISO:'2024-03-15', eventName:'ETHGlobal London', organization:'ETHGlobal', category:'Hackathons', year:2024,
    date:'March 15–17, 2024', location:'London, UK', role:'Hacker',
    lanyardColor:'#6756a5', ink:'#e9dfff', paper:'#393153', design:'ethglobal', mark:'◇', label:'ETHGlobal',
    shortDescription:'One weekend. Four teammates. Far too much coffee. A working idea by Sunday.',
    fullStory:'We arrived with different skill sets and no fixed idea. By Friday evening, a conversation about digital ownership had turned into a prototype. The weekend was a blur of debugging, mentor sessions, and late-night snacks. Our demo wasn’t perfect, but the team was — we still share things we’re working on.',
    takeaway:'Find your people, then find your problem.', badgeImage:null, photos:[]
  },
  {
    id:'github',dateISO:'2024-10-29', eventName:'GitHub Universe', organization:'GitHub', category:'Technology', year:2024,
    date:'October 29–30, 2024', location:'San Francisco, CA', role:'Attendee',
    lanyardColor:'#21252c', ink:'#edf1f2', paper:'#202529', design:'github', mark:'⌘', label:'UNIVERSE',
    shortDescription:'Good code starts with good company. A little open-source inspiration went a long way.',
    fullStory:'I finally met a maintainer whose project I had used for years. We talked about the unglamorous side of open source: answering issues, writing docs, and making newcomers feel welcome. I left the conference and opened my first documentation pull request on the train back.',
    takeaway:'A thoughtful contribution doesn’t have to be a big one.', badgeImage:null, photos:[]
  },
  {
    id:'websummit',dateISO:'2023-11-13', eventName:'Web Summit', organization:'Web Summit', category:'Conferences', year:2023,
    date:'November 13–16, 2023', location:'Lisbon, Portugal', role:'Attendee',
    lanyardColor:'#bf433f', ink:'#fff5e7', paper:'#ce4b46', design:'websummit', mark:'◢', label:'web summit',
    shortDescription:'My first big conference, a city I fell in love with, and a very well-worn pair of shoes.',
    fullStory:'Lisbon was my first solo conference trip. I was nervous walking into a crowd that size, but a shared table at lunch became an afternoon of introductions. Between talks, I got lost in the city’s steep streets and learned that saying hello is usually all it takes.',
    takeaway:'Go, even when you don’t know anyone yet.', badgeImage:null, photos:[]
  },
  {
    id:'react',dateISO:'2024-10-25', eventName:'React Advanced', organization:'GitNation', category:'Workshops', year:2024,
    date:'October 25, 2024', location:'London, UK', role:'Participant',
    lanyardColor:'#287389', ink:'#153f49', paper:'#cce2dc', design:'react', mark:'⚛', label:'REACT',
    shortDescription:'A hands-on day of unlearning old habits and making the web feel a little faster.',
    fullStory:'A performance workshop gave me the space to slow down and understand what the browser was actually doing. Working through a real example with people beside me made concepts click in a way a tutorial never had. I used the same profiling approach on my own project the following week.',
    takeaway:'Measure first. The bottleneck might surprise you.', badgeImage:null, photos:[]
  },
  {
    id:'gdg',dateISO:'2025-11-15', eventName:'DevFest', organization:'Google Developer Groups', category:'Volunteering', year:2025,
    date:'November 15, 2025', location:'Riyadh, Saudi Arabia', role:'Volunteer',
    lanyardColor:'#bf8f32', ink:'#3d3525', paper:'#f3d56f', design:'devfest', mark:'<>', label:'DevFest',
    shortDescription:'Behind the scenes, helping a local community have its moment. My favorite kind of busy.',
    fullStory:'This time I was on the other side of the registration desk. I helped speakers find their rooms, pointed newcomers toward their first sessions, and learned how much invisible work makes an event feel effortless. The thank-you messages afterward made the early start worth it.',
    takeaway:'Communities are built by the people who show up for others.', badgeImage:null, photos:[]
  },
  {
    id:'merge',dateISO:'2026-02-21', eventName:'Merge', organization:'Design & Code Community', category:'Workshops', year:2026,
    date:'February 21, 2026', location:'Dubai, UAE', role:'Speaker',
    lanyardColor:'#405d9f', ink:'#e8efff', paper:'#344e93', design:'merge', mark:'↗', label:'merge.',
    shortDescription:'My first time on stage. A story about building for people, and learning out loud.',
    fullStory:'I shared a small project and the many wrong turns that led to it. The Q&A became an honest conversation about creative confidence, and someone told me the unfinished parts were the most useful. I kept the badge as a reminder that you can have something worth sharing before you have everything figured out.',
    takeaway:'Your process can be someone else’s starting point.', badgeImage:null, photos:[]
  }
];
// Additional sample keepsakes. The rendering component is shared by every entry.
badges.push(
  {id:'google-io',dateISO:'2025-05-20',lanyardPattern:'mosaic',eventName:'Google I/O',organization:'Google',category:'Technology',year:2025,date:'May 20–21, 2025',location:'Mountain View, CA',role:'Attendee',lanyardColor:'#4285c4',ink:'#3c4d49',paper:'#edf0e4',design:'google',mark:'G',label:'I/O 25',shortDescription:'An outdoor stage, bright ideas, and a reminder to keep experimenting.',fullStory:'I joined a watch party before making the trip to the main event. Trying hands-on demos beside the people who built them made the tools feel approachable. My favorite conversation was with another solo attendee waiting in the same line — we ended up comparing side projects for the rest of the afternoon.',takeaway:'Curiosity is a very good conversation starter.',badgeImage:null,photos:[]},
  {id:'microsoft',dateISO:'2024-05-21',eventName:'Microsoft Build',organization:'Microsoft',category:'Technology',year:2024,date:'May 21–23, 2024',location:'Seattle, WA',role:'Attendee',lanyardColor:'#72559e',ink:'#343347',paper:'#eeeaf2',design:'microsoft',mark:'⊞',label:'BUILD',shortDescription:'A rainy Seattle morning and a whole notebook of things to try.',fullStory:'I split my time between developer sessions and the community lounge. A practical discussion about accessible tooling stayed with me longer than any keynote. Back home, I used what I learned to make keyboard navigation a first-class part of my own work.',takeaway:'Better tools should help more people build.',badgeImage:null,photos:[]},
  {id:'devconf',dateISO:'2023-06-16',eventName:'DevConf',organization:'Developer Community',category:'Conferences',year:2023,date:'June 16, 2023',location:'Brno, Czechia',role:'Volunteer',lanyardColor:'#1c8b8e',ink:'#e8f8ef',paper:'#174e55',design:'devconf',mark:'{}',label:'DEV CONF',shortDescription:'Finding my place in a community, one small helping hand at a time.',fullStory:'I helped set up the rooms and welcomed people as they arrived. The behind-the-scenes hours gave me a completely different view of the conference. I learned names, carried cables, and found out how much a calm, friendly welcome can mean.',takeaway:'Small acts make a big room feel personal.',badgeImage:null,photos:[]},
  {id:'hackday',dateISO:'2025-04-12',eventName:'Local Hack Day',organization:'MLH Community',category:'Hackathons',year:2025,date:'April 12–13, 2025',location:'Riyadh, Saudi Arabia',role:'Hacker',lanyardColor:'#c65083',ink:'#f9eafa',paper:'#663b73',design:'hackday',mark:'✳',label:'HACK DAY',shortDescription:'A tiny idea became a real prototype, with friends I had only just met.',fullStory:'We built a simple way to share local learning resources. Our first version was held together with tape, but we tested it with other teams and rewrote the confusing parts. The best feedback came from someone who said they would actually use it.',takeaway:'Make it useful before you make it impressive.',badgeImage:null,photos:[]},
  {id:'design-week',dateISO:'2026-03-07',eventName:'Design Week',organization:'Design Community',category:'Workshops',year:2026,date:'March 7, 2026',location:'Dubai, UAE',role:'Participant',lanyardColor:'#d68c2d',ink:'#563c2b',paper:'#edbd72',design:'designweek',mark:'◐',label:'DESIGN / 26',shortDescription:'A day away from the screen, sketching possibilities instead of polishing pixels.',fullStory:'We worked with paper, markers, and a surprisingly strict timer. Without a familiar tool to hide behind, I had to explain ideas clearly and listen more closely. I came home with messy sketches and a much clearer sense of the problem I wanted to solve.',takeaway:'Sometimes the best tool is a blank piece of paper.',badgeImage:null,photos:[]},
  {id:'community',dateISO:'2024-09-14',eventName:'Community Day',organization:'GDG Riyadh',category:'Volunteering',year:2024,date:'September 14, 2024',location:'Riyadh, Saudi Arabia',role:'Staff',lanyardColor:'#4c8b52',ink:'#edf7df',paper:'#387250',design:'community',mark:'♡',label:'COMMUNITY',shortDescription:'Welcoming first-timers and celebrating the people who make showing up worthwhile.',fullStory:'I spent the day helping people find the right room, the right session, or someone with a shared interest. A first-time attendee asked how to get involved; by the end of the day, they had signed up to help at the next meetup. That is the kind of momentum I want to be part of.',takeaway:'Leave the door open for the next person.',badgeImage:null,photos:[]}
);
// A shared hook line, varied strap lengths, and small rotations create a collected feel.
const strapLengths=[555,650,515,605,635,465,570,660,535,625,475,590,645,550];
badges.forEach((badge,index)=>{badge.position??={x:index*82-18,y:137+(index%3)*3,angle:[-.5,.5,-.3,.6,-.4,.3][index%6],strap:strapLengths[index%strapLengths.length]};});

// Optional presentation metadata; custom records may supply their own dimensions or shape.
const dimensions=[ [148,192],[154,198],[160,200],[148,208],[162,178],[156,186],[160,198],[146,214],[162,185],[152,192],[160,178],[150,194],[154,176],[148,184] ];
badges.forEach((badge,index)=>{
  const [width,height]=dimensions[index%dimensions.length];
  badge.dimensions??={width,height};
  badge.shape??=['sleeve','rounded','clipped','sleeve','landscape','rounded'][index%6];
  badge.dateISO??=`${badge.year}-01-01`;
});

export const boardSize={
  width:Math.max(1200,...badges.map(b=>b.position.x+Math.max(180,80+b.dimensions.width*.34+25))),
  height:Math.max(800,...badges.map(b=>b.position.y+(b.position.strap+b.dimensions.height+32)*.68+30))
};

export const categories = ['All','Technology','Conferences','Hackathons','Workshops','Volunteering'];
export const years = [...new Set(badges.map(b=>b.year))].sort((a,b)=>b-a);
