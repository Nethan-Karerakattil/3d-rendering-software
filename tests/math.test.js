/*
    Tests are written manually, with no external libraries
    (to stick with the philosophy of the rest of the code)

    First item: Function to test
    Second item: Test input
    Third item: Expected output
*/

let tests = [

    // Tests for math.js
    /* 0  */[vector.add, [[2, -101, 2], [4, 2, 2]], [6, -99, 4]],
    /* 1  */[vector.add, [[3, 3, 2], [6, -3, 1]], [9, 0, 3]],
    /* 2  */[vector.add, [[-1, 8, 4], [4, 6, -7]], [3, 14, -3]],

    /* 3  */[vector.sub, [[2, -101, 2], [4, 2, 2]], [-2, -103, 0]],
    /* 4  */[vector.sub, [[3, 3, 2], [6, -3, 1]], [-3, 6, 1]],
    /* 5  */[vector.sub, [[-1, 8, 4], [4, 6, -7]], [-5, 2, 11]],

    /* 6  */[vector.div, [[2, -101, 2], 4], [0.5, -25.25, 0.5]],
    /* 7  */[vector.div, [[3, 3, 2], -5], [-0.6, -0.6, -0.4]],
    /* 8  */[vector.div, [[-1, 8, 4], 8], [-0.125, 1, 0.5]],

    /* 9  */[vector.mul, [[2, -101, 2], 4], [8, -404, 8]],
    /* 10 */[vector.mul, [[3, 3, 2], -5], [-15, -15, -10]],
    /* 11 */[vector.mul, [[-1, 8, 4], 8], [-8, 64, 32]],

    /* 12 */[vector.dp, [[2, -101, 2], [4, 2, 2]], -190],
    /* 13 */[vector.dp, [[3, 3, 2], [6, -3, 1]], 11],
    /* 14 */[vector.dp, [[-1, 8, 4], [4, 6, -7]], 16],

    /* 15 */[vector.cp, [[2, -101, 2], [4, 2, 2]], [-206, 4, 408]],
    /* 16 */[vector.cp, [[3, 3, 2], [6, -3, 1]], [9, 9, -27]],
    /* 17 */[vector.cp, [[-1, 8, 4], [4, 6, -7]], [-80, 9, -38]],

    
];

function test_app() {
    let all_pass = true;

    for (let i = 0; i < tests.length; i++) {
        if (!deep_equal(i, tests[i][0](...tests[i][1]), tests[i][2])) {
            console.log("Test " + i + " failed\nGot: " + tests[i][0](...tests[i][1]) + "\nExpected: " + tests[i][2]);
            all_pass = false;
        }
    }

    if (all_pass) {
        console.log("All tests passed.");
    }
}

/**
 * Checks if 2 variables are the same
 * @param {integer} test_id index of the test
 * @param {any} x variable 1
 * @param {any} y variable 2
 * @returns {boolean}
 */
function deep_equal(test_id, x, y) {
    if (typeof x !== typeof y) return false;

    if (Array.isArray(x)) {
        for (let i = 0; i < x.length; i++) {
            if (typeof x[i] !== typeof y[i]) return false;

            // Check if item is matrix or vector
            if (Array.isArray(x[i])) {
                for (let j = 0; j < x[i].length; j++) {
                    if (x[i][j] !== y[i][j]) return false;
                }
            } else {
                if (x[i] !== y[i]) return false;
            }
        }
    } else if (typeof x === "number") {
        if (x != y) return false;
    } else {
        console.log("Unexpected variable type for test " + test_id);
        return false;
    }

    return true;
}