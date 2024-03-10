async function getSolveCountsOfContestById(id) {
    const response = await fetch(`https://vjudge.net/contest/rank/single/${id}`)
	const json_response = await response.json();
	const submissions_info = json_response['submissions'];
	const participants_info = json_response['participants'];
	const userid_to_handle = {};
	for (let i in participants_info) {
		userid_to_handle[i] = participants_info[i][0].toLocaleLowerCase();
	}
	const participant_solved_problems = {};
	for (let i in submissions_info) {
		const problemId = submissions_info[i][1],
			user_id = userid_to_handle[submissions_info[i][0]],
			verdict = submissions_info[i][2];
		if (!participant_solved_problems.hasOwnProperty(user_id)) {
			participant_solved_problems[user_id] = new Set();
		}
		if (verdict == 1) {
			participant_solved_problems[user_id].add(problemId);
		}
	}
	return participant_solved_problems;
}
const table = document.querySelector('table');
function getColor(percent) {
	percent = Math.min(100, Math.max(0, percent));
	var red = percent < 50 ? 255 : Math.round(255 - (percent - 50) * 5.1);
	var green = percent > 50 ? 255 : Math.round((percent * 5.1));
	var color = 'rgb(' + red + ',' + green + ', 0)';
	return color;
}

function getColorMatte(percent) {
	percent = Math.min(100, Math.max(0, percent));
	var red = percent < 50 ? 255 : Math.round(255 - (percent - 50) * 5.1);
	var green = percent > 50 ? 255 : Math.round((percent * 5.1));
	var color = 'rgba(' + red + ',' + green + ',0, 0.3)';
	return color;
}

const lowerCaseHandle_to_Original = {};
for (handle in participants_names) {
	lowerCaseHandle_to_Original[handle.toLocaleLowerCase()] = handle;
}

function addDataToTable(entries) {

	let totalProblemCount = 0;
	for (i in contests) {
		totalProblemCount += contests[i][1];
	}

    const tbody = document.createElement('tbody');

	const head_row = document.createElement('tr');
	
    const rankCol = document.createElement('td');
	rankCol.textContent = 'Rank';
	head_row.appendChild(rankCol);

	const nameCol = document.createElement('td');
	nameCol.textContent = 'Participants';
    head_row.appendChild(nameCol);

	const totSolCol = document.createElement('td');
	totSolCol.textContent = `Solved (${totalProblemCount})`;
	head_row.appendChild(totSolCol);

	for (let i in contests) {
		const th = document.createElement('td');
		th.style.color = 'blue'
		const contestHyperLink = document.createElement('a');
		contestHyperLink.href = `https://vjudge.net/contest/${i}`;
		contestHyperLink.target = '_blank'
		contestHyperLink.textContent = `${contests[i][0]} (${contests[i][1]})`;
        th.appendChild(contestHyperLink)
        head_row.appendChild(th);
	}
	tbody.appendChild(head_row);
	
    let participant_rank = 1;
    
	for (let i in entries) {
		const user = entries[i][0];
		const tr = document.createElement('tr');
		
        const rank = document.createElement('td');
		rank.textContent = `${participant_rank ++}`;
		tr.appendChild(rank);
		
        const p = Math.round((entries[i][1].total * 100) / totalProblemCount);
		
        const participant = document.createElement('td');
		const name = document.createElement('span');
		name.textContent = `${participants_names[lowerCaseHandle_to_Original[user]]} `;
        participant.appendChild(name);

		const handle = document.createElement('a');
		handle.style.fontSize = 'small';
		handle.href = `https://vjudge.net/user/${lowerCaseHandle_to_Original[user]}`;
		handle.textContent = `${lowerCaseHandle_to_Original[user]}`;
		handle.target = '_blank';
        participant.appendChild(handle);
		
        tr.appendChild(participant);

		const totSolved = document.createElement('td');
		totSolved.innerHTML = `${entries[i][1].total}  [ <strong>${p}% </strong>]`;
		totSolved.style.backgroundColor = getColor(p);
		tr.appendChild(totSolved);

		
        const user_contest = entries[i][1];
		for (c in contests) {
			let solvecnt = 0;
			const td = document.createElement('td');
			if (user_contest.hasOwnProperty(c)) {
				if(user_contest[c] == contests[c][1]){
					td.innerHTML = `<i class="fa-solid fa-check fa-lg"></i>`;
				}else{
					td.innerHTML = `${user_contest[c]}`;
				}
				solvecnt = user_contest[c];
			} else {
				td.textContent = ' ';
			}
			td.style.backgroundColor = getColorMatte((solvecnt * 100) / contests[c][1]);
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
}

async function run_it() {
	const temp_table = {};
	for (let i in lowerCaseHandle_to_Original) {
		temp_table[i] = {};
	}
	for (let contest_id in contests) {
		const solve_count = await getSolveCountsOfContestById(contest_id);
		for (let handle in solve_count) {
			if (lowerCaseHandle_to_Original.hasOwnProperty(handle)) {
				temp_table[handle][contest_id] = solve_count[handle].size;
			}
		}
	}
	for (handle in temp_table) {
		let tot = 0;
		for (i in temp_table[handle]) {
			tot += temp_table[handle][i];
		}
		temp_table[handle].total = tot;
	}
	const entries = Object.entries(temp_table);
	entries.sort((a, b) => b[1].total - a[1].total);
	addDataToTable(entries);
}

run_it();