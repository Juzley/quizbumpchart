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
            teamInfo = {},
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

            // Add the results into the teamInfo map - the index in the
            // roundScores array is the position for that round.
            for (j = 0; j < roundScores.length; j += 1) {
                teamName = roundScores[j][0];
                score = roundScores[j][1];
                position = j;

                if (!teamInfo.hasOwnProperty(teamName)) {
                    teamInfo[teamName] = {
                        positions: [position],
                        scores: [score]
                    };
                } else {
                    teamInfo[teamName].positions.push(position);
                    teamInfo[teamName].scores.push(score);
                }
            }
        }

        return teamInfo;
    }

    function teamColour(colourIndex) {
        var colours = [
            "red",
            "orange",
            "green",
            "blue",
            "indigo",
            "violet",
            "black"
        ];

        return colours[colourIndex % colours.length];
    }

    function drawChart(teamInfo) {
        var columnWidth,
            columnsStart,
            rowHeight = 50,
            teamName,
            teamNameWidth,
            teamNameHeight = 30,
            maxTeamNameWidth = 0,
            positions,
            scores,
            scoreString,
            scoreWidth,
            scoreHeight = 20,
            deltaString,
            deltaWidth,
            deltaHeight = 20,
            ctx,
            colourIndex,
            colourMap = {},
            padding = 20,
            i,
            x,
            y;

        ctx = $("#graph")[0].getContext("2d");
        ctx.canvas.height = rowHeight * Object.keys(teamInfo).length;
        ctx.canvas.width = $(window).width() * 0.95;

        ctx.font = teamNameHeight.toString() + "pt Arial";

        // Find the width of the teamname columns
        for (teamName in teamInfo) {
            if (teamInfo.hasOwnProperty(teamName)) {
                teamNameWidth = ctx.measureText(teamName).width;
                if (teamNameWidth > maxTeamNameWidth) {
                    maxTeamNameWidth = teamNameWidth;
                }
            }
        }

        // Set up team colours
        colourIndex = 0;
        for (teamName in teamInfo) {
            if (teamInfo.hasOwnProperty(teamName)) {
                colourMap[teamName] = teamColour(colourIndex);
                colourIndex += 1;
            }
        }

        // Draw the teamnames
        for (teamName in teamInfo) {
            if (teamInfo.hasOwnProperty(teamName)) {
                positions = teamInfo[teamName].positions;
                teamNameWidth = ctx.measureText(teamName).width;

                ctx.fillStyle = colourMap[teamName];
                ctx.fillText(
                    teamName,
                    maxTeamNameWidth - teamNameWidth,
                    (positions[0] + 0.5) * rowHeight + teamNameHeight / 2
                );
                ctx.fillText(
                    teamName,
                    ctx.canvas.width - maxTeamNameWidth,
                    (positions[positions.length - 1] + 0.5) * rowHeight +
                        teamNameHeight / 2
                );
            }
        }

        // Draw the lines
        columnWidth = (
            (ctx.canvas.width - padding * 2 - maxTeamNameWidth * 2) / 2
        );
        columnsStart = maxTeamNameWidth + padding;
        for (teamName in teamInfo) {
            if (teamInfo.hasOwnProperty(teamName)) {
                positions = teamInfo[teamName].positions;

                ctx.beginPath();
                ctx.moveTo(columnsStart, (positions[0] + 0.5) * rowHeight);
                for (i = 1; i < positions.length; i += 1) {
                    ctx.lineTo(
                        columnsStart + columnWidth * i,
                        (positions[i] + 0.5) * rowHeight
                    );
                }
                ctx.strokeStyle = colourMap[teamName];
                ctx.stroke();
            }
        }

        // Draw scores over the lines
        ctx.font = scoreHeight.toString() + "pt Arial";
        for (teamName in teamInfo) {
            if (teamInfo.hasOwnProperty(teamName)) {
                positions = teamInfo[teamName].positions;
                scores = teamInfo[teamName].scores;

                ctx.fillStyle = colourMap[teamName];
                for (i = 0; i < scores.length; i += 1) {
                    scoreString = scores[i].toString();
                    scoreWidth = ctx.measureText(scoreString).width;

                    ctx.fillText(
                        scoreString,
                        columnsStart + columnWidth * i - scoreWidth / 2,
                        (positions[i] + 0.5) * rowHeight + scoreHeight / 2
                    );
                }
            }
        }

        // Draw the deltas
        ctx.font = deltaHeight.toString() + "pt Arial";
        for (teamName in teamInfo) {
            if (teamInfo.hasOwnProperty(teamName)) {
                positions = teamInfo[teamName].positions;
                scores = teamInfo[teamName].scores;

                ctx.fillStyle = colourMap[teamName];
                for (i = 1; i < positions.length; i += 1) {
                    deltaString = "+" + (scores[i] - scores[i - 1]).toString();
                    deltaWidth = ctx.measureText(deltaString).width;

                    x = columnsStart + (columnWidth * (i * 2 - 1) / 2);
                    x -= deltaWidth / 2;
                    y = (positions[i] + positions[i - 1] + 1) * rowHeight / 2;

                    ctx.fillText(deltaString, x, y);
                }
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
        // Add some team entry areas, assume we'll always have at least 3.
        addTeam();
        addTeam();
        addTeam();

        $("#addTeamButton").click(function () { addTeam(); });
        $("#chart-tab").click(function () { drawChart(calcPositions()); });
        $(window).resize(function () { drawChart(calcPositions()); });
    }());
}($));
