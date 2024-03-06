
async function getSolveCounts(response){
    const json_response = await response.json();
    const submissions_info  = json_response['submissions'];
    const participants_info = json_response['participants'];
    const id_to_handle = {};
    for(let i in participants_info){
        id_to_handle[i] = participants_info[i][0];
    }
    const participants_by_contest = {};
    for(let i in submissions_info){
        const problemId = submissions_info[i][1], user_id = id_to_handle[submissions_info[i][0]], verdict = submissions_info[i][2];
        if(!participants_by_contest.hasOwnProperty(user_id)){
            participants_by_contest[user_id] = new Set();
        }
        if(verdict == 1){
            participants_by_contest[user_id].add(problemId);
        }
    }
    return participants_by_contest;
}


const table = document.querySelector('table');


function getColor(percent) {
    percent = Math.min(100, Math.max(0, percent));
    var red = percent < 50 ? 255 : Math.round(255 - (percent - 50) * 5.1);
    var green = percent > 50 ? 255 : Math.round((percent * 5.1));
    var color = 'rgb(' + red + ',' + green + ',0)';
    return color;
}

function getColorMatte(percent) {
    percent = Math.min(100, Math.max(0, percent));
    var red = percent < 50 ? 255 : Math.round(255 - (percent - 50) * 5.1);
    var green = percent > 50 ? 255 : Math.round((percent * 5.1));
    var color = 'rgba(' + red + ',' + green + ',0, 0.3)';
    return color;
}

function fit(entries){

    let totalProblemCount = 0;
    for(i in contests){
        totalProblemCount += contests[i][1];
    }

    const thead = document.createElement('thead');
    const head_row = document.createElement('tr');

    const rankCol = document.createElement('th');
    rankCol.textContent = 'Rank';
    head_row.appendChild(rankCol);

    const nameCol = document.createElement('th');
    nameCol.textContent = 'Name';

    const totSolCol = document.createElement('th');
    totSolCol.textContent = `Solved (${totalProblemCount})`;
    
    head_row.appendChild(nameCol);
    head_row.appendChild(totSolCol);

    for(let i in contests){
        const th = document.createElement('th');
        th.style.color = 'blue'
        const clink = document.createElement('a');
        clink.href = `https://vjudge.net/contest/${i}`;
        clink.target = '_blank'
        clink.textContent = `${contests[i][0]} (${contests[i][1]})`;
        th.appendChild(clink)
        head_row.appendChild(th);
    }
    thead.appendChild(head_row);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    let cnt = 1;

    for(let i in entries){
        const user = entries[i][0];
        const tr = document.createElement('tr');

        const rank =  document.createElement('td');
        rank.textContent = `${cnt ++}`;
        tr.appendChild(rank);

        const p = Math.floor((entries[i][1].total * 100) / totalProblemCount);

        const name = document.createElement('td');

        // const handle = document.createElement('a');
        // handle.href = `https://vjudge.net/user/${entries[i]}`;

       const nm = document.createElement('span');
       nm.textContent = `${participants_names[user]} `;

       const handle = document.createElement('a');
       handle.style.fontSize = 'small';
       handle.href = `https://vjudge.net/user/${entries[i][0]}`;
       handle.textContent = ` ${entries[i][0]}`;
       handle.target = '_blank';
        
       name.appendChild(nm);
       name.appendChild(handle);
        
        tr.appendChild(name);

        const totSolved = document.createElement('td');

        totSolved.textContent = `${entries[i][1].total} (${p}%)`;

        totSolved.style.backgroundColor = getColor(p);

        tr.appendChild(totSolved);

        const user_contest  = entries[i][1];

        

        for(c in contests){
            let solvecnt = 0;
            const td = document.createElement('td');
            if(user_contest.hasOwnProperty(c)){
                td.textContent = `${user_contest[c]}`;
                solvecnt = user_contest[c];
            }else{
                td.textContent = 'X'
            }
            td.style.backgroundColor = getColorMatte((solvecnt * 100 )/ contests[c][1]);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
}


async function run_it(){
    const temp_table = {};
    for(let i in participants_names){
        temp_table[i] = {};
    }
    for(let id in contests){
        const response = await fetch(`https://vjudge.net/contest/rank/single/${id}`);
        const solve_count = await getSolveCounts(response);
        for(let handle in solve_count){
            if(participants_names.hasOwnProperty(handle)){
                temp_table[handle][id] = solve_count[handle].size;
            }
        }
    }
    for(handle in temp_table){
        let tot = 0;
        for(i in temp_table[handle]){
            tot += temp_table[handle][i];
        }
        temp_table[handle].total = tot;
    }
    const entries = Object.entries(temp_table);
    entries.sort((a, b) => b[1].total - a[1].total);
    fit(entries);
}

run_it();

