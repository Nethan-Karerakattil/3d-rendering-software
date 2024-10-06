/**
 * Draw a wireframe
 * @param {CanvasContext} ctx 
 * @param {array} proj_tris 
 */
function wireframe(ctx, proj_tris) {
    for (let i = 0; i < proj_tris.length; i++) {
        ctx.strokeStyle = "#f00";

        ctx.beginPath();
        ctx.moveTo(proj_tris[i][0][0], proj_tris[i][0][1]);
        ctx.lineTo(proj_tris[i][1][0], proj_tris[i][1][1]);
        ctx.lineTo(proj_tris[i][2][0], proj_tris[i][2][1]);
        ctx.lineTo(proj_tris[i][0][0], proj_tris[i][0][1]);
        ctx.stroke();
    }
}

/**
 * Loads a .obj file
 * @param {string} text 
 * @returns {array}
 */
function load_obj(text) {
    let v = [];
    let vt = [];
    let vn = [];
    let f0 = [];
    let f1 = [];
    let f2 = [];

    let lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].split(" ");

        switch (lines[i][0]) {
            case "v":
                lines[i].splice(0, 1);

                for (let j = 0; j < lines[i].length; j++) lines[i][j] = parseFloat(lines[i][j]);
                v.push(lines[i]);
                break;

            case "vt":
                lines[i].splice(0, 1);

                for (let j = 0; j < 3; j++) lines[i][j] = parseFloat(lines[i][j]);
                vt.push([lines[i][0], lines[i][1], 0]);
                break;

            case "f":
                lines[i].splice(0, 1);

                if (lines[i].length == 3) {
                    for (let j = 0; j < lines[i].length; j++) {
                        lines[i][j] = lines[i][j].split("/");

                        lines[i][j][0] = parseInt(lines[i][j][0]);
                        lines[i][j][1] = parseInt(lines[i][j][1]);
                        lines[i][j][2] = parseInt(lines[i][j][2]);
                    }

                    f0.push([lines[i][0][0], lines[i][1][0], lines[i][2][0]]);
                    if (lines[i][0][1]) f1.push([lines[i][0][1], lines[i][1][1], lines[i][2][1]]);
                    if (lines[i][0][2]) f2.push([lines[i][0][2], lines[i][1][2], lines[i][2][2]]);

                } else if (lines[i].length == 4) {
                    for (let j = 0; j < lines[i].length; j++) {
                        lines[i][j] = lines[i][j].split("/");

                        lines[i][j][0] = parseInt(lines[i][j][0]);
                        lines[i][j][1] = parseInt(lines[i][j][1]);
                        lines[i][j][2] = parseInt(lines[i][j][2]);
                    }

                    f0.push([lines[i][0][0], lines[i][1][0], lines[i][3][0]]);
                    f0.push([lines[i][1][0], lines[i][2][0], lines[i][3][0]]);

                    if (lines[i][0][1]) {
                        f1.push([lines[i][0][1], lines[i][1][1], lines[i][3][1]]);
                        f1.push([lines[i][1][1], lines[i][2][1], lines[i][3][1]]);
                    }

                    if (lines[i][0][2]) {
                        f2.push([lines[i][0][2], lines[i][1][2], lines[i][3][2]]);
                        f2.push([lines[i][1][2], lines[i][2][2], lines[i][3][2]]);
                    }
                }
                break;
        }
    }

    let new_tris = [];
    for (let i = 0; i < f0.length; i++) {
        new_tris[i] = [];
        new_tris[i][0] = v[f0[i][0] - 1];
        new_tris[i][1] = v[f0[i][1] - 1];
        new_tris[i][2] = v[f0[i][2] - 1];
    }

    let new_uv = [];
    for (let i = 0; i < f1.length; i++) {
        new_uv[i] = [];
        new_uv[i][0] = vt[f1[i][0] - 1];
        new_uv[i][1] = vt[f1[i][1] - 1];
        new_uv[i][2] = vt[f1[i][2] - 1];
    }

    data = new_tris;
    data_uv = new_uv;
}

/**
 * Calculates the world matrix
 * @param {vector} rot rotation of scene
 * @returns {matrix}
 */
function calc_world_mat(rot) {
    let world_mat = mat_math.make_identity();
    world_mat = mat_math.mult_mat(mat_math.rot_x(rot[0]), mat_math.rot_y(rot[1]));
    world_mat = mat_math.mult_mat(world_mat, mat_math.rot_z(rot[2]));
    return world_mat;
}

/**
 * Draws a triangle
 * @param {triangle} tri Triangle
 * @param {triangle_uv} uv UV coordinates for triangle
 * @param {shader} frag_shader Fragment shader function 
 */
function draw_triangle(tri, uv, frag_shader) {

    ctx.fillStyle = "rgb(255, 255, 255)";

    let x1 = tri[0][0];
    let x2 = tri[1][0];
    let x3 = tri[2][0];

    let y1 = tri[0][1];
    let y2 = tri[1][1];
    let y3 = tri[2][1];

    let u1 = uv[0][0];
    let u2 = uv[1][0];
    let u3 = uv[2][0];

    let v1 = uv[0][1];
    let v2 = uv[1][1];
    let v3 = uv[2][1];

    let w1 = uv[0][2];
    let w2 = uv[1][2];
    let w3 = uv[2][2];

    if (y2 < y1) {
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
        [u1, u2] = [u2, u1];
        [v1, v2] = [v2, v1];
        [w1, w2] = [w2, w1];
    }

    if (y3 < y1) {
        [x1, x3] = [x3, x1];
        [y1, y3] = [y3, y1];
        [u1, u3] = [u3, u1];
        [v1, v3] = [v3, v1];
        [w1, w3] = [w3, w1];
    }

    if (y3 < y2) {
        [x2, x3] = [x3, x2];
        [y2, y3] = [y3, y2];
        [u2, u3] = [u3, u2];
        [v2, v3] = [v3, v2];
        [w2, w3] = [w3, w2];
    }

    let dx1 = x2 - x1;
    let dy1 = y2 - y1;
    let du1 = u2 - u1;
    let dv1 = v2 - v1;
    let dw1 = w2 - w1;

    let dx2 = x3 - x1;
    let dy2 = y3 - y1;
    let du2 = u3 - u1;
    let dv2 = v3 - v1;
    let dw2 = w3 - w1;

    let dax_step = 0;
    let dbx_step = 0;
    let du1_step = 0;
    let du2_step = 0;
    let dv1_step = 0;
    let dv2_step = 0;
    let dw1_step = 0;
    let dw2_step = 0;

    if (dy1) {
        dax_step = dx1 / Math.abs(dy1);
        du1_step = du1 / Math.abs(dy1);
        dv1_step = dv1 / Math.abs(dy1);
        dw1_step = dw1 / Math.abs(dy1);
    }

    if (dy2) {
        dbx_step = dx2 / Math.abs(dy2);
        du2_step = du2 / Math.abs(dy2);
        dv2_step = dv2 / Math.abs(dy2);
        dw2_step = dw2 / Math.abs(dy2);
    }

    if (dy1) {
        for (let i = y1; i <= y2; i++) {
            let ax = x1 + (i - y1) * dax_step;
            let bx = x1 + (i - y1) * dbx_step;

            let tex_su = u1 + (i - y1) * du1_step;
            let tex_sv = v1 + (i - y1) * dv1_step;
            let tex_sw = w1 + (i - y1) * dw1_step;

            let tex_eu = u1 + (i - y1) * du2_step;
            let tex_ev = v1 + (i - y1) * dv2_step;
            let tex_ew = w1 + (i - y1) * dw2_step;

            if (ax > bx) {
                [ax, bx] = [bx, ax];
                [tex_su, tex_eu] = [tex_eu, tex_su];
                [tex_sv, tex_ev] = [tex_ev, tex_sv];
                [tex_sw, tex_ew] = [tex_ew, tex_sw];
            }

            let tex_u = tex_su;
            let tex_v = tex_sv;
            let tex_w = tex_sw;

            let t_step = 1 / (bx - ax);
            let t = 0;

            for (let j = ax; j < bx; j++) {
                tex_u = (1 - t) * tex_su + t * tex_eu;
                tex_v = (1 - t) * tex_sv + t * tex_ev;
                tex_w = (1 - t) * tex_sw + t * tex_ew;

                frag_shader(Math.round(j), Math.round(i), tex_u / tex_w, tex_v / tex_w);
                t += t_step;
            }
        }
    }

    dx1 = x3 - x2;
    dy1 = y3 - y2;
    du1 = u3 - u2;
    dv1 = v3 - v2;
    dw1 = w3 - w2;

    du1_step = 0;
    dv1_step = 0;

    if (dy2) dbx_step = dx2 / Math.abs(dy2);

    if (dy1) {
        dax_step = dx1 / Math.abs(dy1);
        du1_step = du1 / Math.abs(dy1);
        dv1_step = dv1 / Math.abs(dy1);
        dw1_step = dw1 / Math.abs(dy1);
    }

    if (dy1) {
        for (let i = y2; i <= y3; i++) {
            let ax = x2 + (i - y2) * dax_step;
            let bx = x1 + (i - y1) * dbx_step;

            let tex_su = u2 + (i - y2) * du1_step;
            let tex_sv = v2 + (i - y2) * dv1_step;
            let tex_sw = w2 + (i - y2) * dw1_step;

            let tex_eu = u1 + (i - y1) * du2_step;
            let tex_ev = v1 + (i - y1) * dv2_step;
            let tex_ew = w1 + (i - y1) * dw2_step;

            if (ax > bx) {
                [ax, bx] = [bx, ax];
                [tex_su, tex_eu] = [tex_eu, tex_su];
                [tex_sv, tex_ev] = [tex_ev, tex_sv];
                [tex_sw, tex_ew] = [tex_ew, tex_sw];
            }

            let tex_u = tex_su;
            let tex_v = tex_sv;
            let tex_w = tex_sw;

            let t_step = 1 / (bx - ax);
            let t = 0;

            for (let j = ax; j < bx; j++) {
                tex_u = (1 - t) * tex_su + t * tex_eu;
                tex_v = (1 - t) * tex_sv + t * tex_ev;
                tex_w = (1 - t) * tex_sw + t * tex_ew;

                frag_shader(Math.round(j), Math.round(i), tex_u / tex_w, tex_v / tex_w);
                t += t_step;
            }
        }
    }
}

/**
 * Sets the color of a pixel in the color buffer
 * @param {color} color Color of the pixel
 * @param {vector} loc The location of the pixel (x, y)
 * @param {buffer} buffer Color buffer
 */
function set_color(color, loc, buffer) {
    let index = (loc[0] * 4) + (loc[1] * canvas.width * 4);

    buffer.data[index + 0] = color[0];
    buffer.data[index + 1] = color[1];
    buffer.data[index + 2] = color[2];
    buffer.data[index + 3] = 255;
}