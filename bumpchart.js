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
            newText,
            newLine,
            x1,
            y1,
            x2,
            y2,
            i;

        for (teamName in teamPositions) {
            if (teamPositions.hasOwnProperty(teamName)) {
                positions = teamPositions[teamName];

                newText = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'text'
                );
                newText.appendChild(document.createTextNode(teamName));
                $(newText).attr({ x: 0, y: 15 + positions[0] * rowHeight });
                $("#graph").append(newText);

                for (i = 0; i < positions.length - 1; i += 1) {
                    x1 = columnWidth * i;
                    y1 = positions[i] * rowHeight;
                    x2 = columnWidth * (i + 1);
                    y2 = positions[i + 1] * rowHeight;

                    newLine = document.createElementNS(
                        'http://www.w3.org/2000/svg',
                        'line'
                    );
                    $(newLine).attr({ x1: x1, y1: y1, x2: x2, y2: y2 });
                    $("#graph").append(newLine);
                }
            }
        }
    }

    (function init() {
        $("#generateButton").click(function () {
            drawChart(calcPositions());
        });
    }());
}($));
