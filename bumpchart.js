/*jslint browser: true*/
/*global $, window*/
'use strict';

var BumpChart = window.BumpChart || {};

BumpChart = (function ($) {
    function calcPositions() {
        var i,
            j,
            teamName,
            roundScores,
            score,
            position,
            numRounds = 3,
            rounds = [],
            teamPositions = {},
            sortFn;

        // Clear previous graphs
        $("line").each(function () {
            this.parentNode.removeChild(this);
        });

        // Populate the rounds array.
        // Each element in the array is an object mapping team name to score
        // e.g. [{team1: 3, team2: 1, team3: 2},
        //       {team1: 3, team2: 4, team3: 4},
        //       {team1: 3, team2: 5, team3: 4}]
        $('.team-input').each(function () {
            teamName = $('.teamname-input', this).val();

            for (i = 0; i < numRounds; i += 1) {
                score = $(".round" + i.toString() + "-input", this).val();

                if (teamName !== "" && score !== "") {
                    if (rounds.length === i) {
                        rounds.push({});
                    }
                    rounds[i][teamName] = parseInt(score, 10);
                }
            }
        });

        // Work out the positions for each round, we store these in an object
        // mapping teamname to an array of their positions in each round
        // e.g.  {team1: [0, 2, 2], team2: [2, 1, 0], team3: [1, 0, 1]}
        sortFn = function (a, b) { return b[1] - a[1]; };
        for (i = 0; i < rounds.length; i += 1) {
            roundScores = [];
            for (teamName in rounds[i]) {
                if (rounds[i].hasOwnProperty(teamName)) {
                    roundScores.push([teamName, rounds[i][teamName]]);
                }
            }

            // roundScores is now an array of [teamname, score] pairs,
            // e.g. [["team 1", 0], ["team 2", 3], ["team 3", 1]]
            // Sort it to so that the best team is first.
            roundScores.sort(sortFn);

            // Add the results into the teamPositions map - the index in the
            // roundScores array is the position for that round.
            for (j = 0; j < roundScores.length; j += 1) {
                teamName = roundScores[j][0];
                position = j;

                if (!teamPositions.hasOwnProperty(teamName)) {
                    teamPositions[teamName] = [position];
                } else {
                    teamPositions[teamName].push(position);
                }
            }
        }

        return teamPositions;
    }

    function drawChart(teamPositions) {
        var columnWidth = 100,
            rowHeight = 100,
            teamName,
            positions,
            ctx,
            i;

        ctx = $("#graph")[0].getContext("2d");
        ctx.canvas.height = 300;
        ctx.canvas.width = 300;

        for (teamName in teamPositions) {
            if (teamPositions.hasOwnProperty(teamName)) {
                positions = teamPositions[teamName];

                ctx.beginPath();
                ctx.moveTo(0, positions[0] * rowHeight);
                for (i = 1; i < positions.length; i += 1) {
                    ctx.lineTo(
                        columnWidth * i,
                        positions[i] * rowHeight
                    );
                }
                ctx.stroke();
            }
        }
    }

    function addTeam() {
        var markup =
            "<tr class='team-input'>" +
            "<td><input class='teamname-input' id='teamname-input'></td>" +
            "<td><input class='round0-input' id='teamname-input'></td>" +
            "<td><input class='round1-input' id='teamname-input'></td>" +
            "<td><input class='round2-input' id='teamname-input'></td>" +
            "</tr>";
        $("#team-input-table tbody").append(markup);
    }

    (function init() {
        // Add a single team.
        addTeam();

        $("#addTeamButton").click(function () { addTeam(); });
        $("#generateButton").click(function () {
            drawChart(calcPositions());
        });
    }());
}($));
