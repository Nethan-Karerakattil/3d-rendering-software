/**
 * Draws a wireframe
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

            // Parse model vertex data
            case "v":
                lines[i].splice(0, 1);

                for (let j = 0; j < lines[i].length; j++) lines[i][j] = parseFloat(lines[i][j]);
                v.push(lines[i]);
                break;

            // Parse texture vertex data
            case "vt":
                lines[i].splice(0, 1);

                for (let j = 0; j < 3; j++) lines[i][j] = parseFloat(lines[i][j]);
                vt.push([lines[i][0], lines[i][1], 0]);
                break;

            // Parse face data
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
 * Draws a textured triangle
 * @param {triangle} tri Triangle
 * @param {triangle_uv} uv UV coordinates for triangle
 * @param {shader} frag_shader Fragment shader function 
 */
function draw_triangle(tri_id, tri, uv, depth_buffer, frag_shader) {
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

    // Sort points in the triangle
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

    // Calculate step variables
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

    // Loop over points from top to bottom
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

            // Loop over points from left to right
            for (let j = ax; j < bx; j++) {
                tex_u = (1 - t) * tex_su + t * tex_eu;
                tex_v = (1 - t) * tex_sv + t * tex_ev;
                tex_w = (1 - t) * tex_sw + t * tex_ew;

                let rounded = [Math.round(j), Math.round(i)];
                if (!(rounded[0] >= canvas.width || rounded[0] <= 0 || rounded[1] >= canvas.height || rounded[1] <= 0)) {
                    if (tex_w > depth_buffer[rounded[0] - 1][rounded[1] - 1]) {
                        frag_shader(tri_id, rounded[0], rounded[1], tex_u / tex_w, tex_v / tex_w);
                        depth_buffer[rounded[0] - 1][rounded[1] - 1] = tex_w;
                    }
                }

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

    // Calculate new step variables
    if (dy2) {
        dbx_step = dx2 / Math.abs(dy2);
    }

    if (dy1) {
        dax_step = dx1 / Math.abs(dy1);
        du1_step = du1 / Math.abs(dy1);
        dv1_step = dv1 / Math.abs(dy1);
        dw1_step = dw1 / Math.abs(dy1);
    }

    // Loop over points from top to bottom again
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

            // Loop over points from left to right again
            for (let j = ax; j < bx; j++) {
                tex_u = (1 - t) * tex_su + t * tex_eu;
                tex_v = (1 - t) * tex_sv + t * tex_ev;
                tex_w = (1 - t) * tex_sw + t * tex_ew;

                // todo: triangle anti-aliasing
                let rounded = [Math.round(j), Math.round(i)];
                if (!(rounded[0] >= canvas.width || rounded[0] <= 0 || rounded[1] >= canvas.height || rounded[1] <= 0)) {
                    if (tex_w > depth_buffer[rounded[0] - 1][rounded[1] - 1]) {
                        frag_shader(tri_id, rounded[0], rounded[1], tex_u / tex_w, tex_v / tex_w);
                        depth_buffer[rounded[0] - 1][rounded[1] - 1] = tex_w;
                    }
                }

                t += t_step;
            }
        }
    }
}

/**
 * Sets a pixel in the color buffer
 * @param {color} color Color of the pixel
 * @param {vector} loc The location of the pixel (x, y)
 * @param {buffer} buffer Color buffer
 */
function set_color(color, loc, buffer) {
    if (loc[0] < 0 || loc[0] > buffer.width) return;
    if (loc[1] < 0 || loc[1] > buffer.height) return;

    let index = (loc[0] * 4) + (loc[1] * canvas.width * 4);

    buffer.data[index + 0] = color[0];
    buffer.data[index + 1] = color[1];
    buffer.data[index + 2] = color[2];
    buffer.data[index + 3] = 255;
}

/**
 * Finds the point of intersection of 2 lines
 * @param {vector} plane_p Point on plane
 * @param {vector} plane_n Normal plane
 * @param {vector} line_start Start of the line
 * @param {vector} line_end End of the line
 * @returns {array} Point of intersection
 */
function intersect_plane(plane_p, plane_n, line_start, line_end) {
    plane_n = vector.norm(plane_n);
    let plane_d = -vector.dp(plane_n, plane_p);
    let ad = vector.dp(line_start, plane_n);
    let bd = vector.dp(line_end, plane_n);
    let t = (-plane_d - ad) / (bd - ad);
    let line_start_to_end = vector.sub(line_end, line_start);
    let line_to_intersect = vector.mul(line_start_to_end, t);
    return [vector.add(line_start, line_to_intersect), t];
}

/**
 * Clips a triangle
 * @param {vector} plane_p Point on plane
 * @param {vector} plane_n Normal to plane
 * @param {triangle} in_tri Input triangle
 * @param {triangle} in_tex Input texture
 * @returns {array} Array of triangles vertex data and triangle texture data
 */
function clip(plane_p, plane_n, in_tri, in_tex) {    
    plane_n = vector.norm(plane_n);

    let inside_points = [];
    let outside_points = [];
    let inside_tex = [];
    let outside_tex = [];

    let d0 = dist(plane_p, plane_n, in_tri[0]);
    let d1 = dist(plane_p, plane_n, in_tri[1]);
    let d2 = dist(plane_p, plane_n, in_tri[2]);

    if (d0 >= 0) {
        inside_points.push(in_tri[0]);
        inside_tex.push(in_tex[0]);
    } else {
        outside_points.push(in_tri[0]);
        outside_tex.push(in_tex[0]);
    }

    if (d1 >= 0) {
        inside_points.push(in_tri[1]);
        inside_tex.push(in_tex[1]);
    } else {
        outside_points.push(in_tri[1]);
        outside_tex.push(in_tex[1]);
    }

    if (d2 >= 0) {
        inside_points.push(in_tri[2]);
        inside_tex.push(in_tex[2]);
    } else {
        outside_points.push(in_tri[2]);
        outside_tex.push(in_tex[2]);
    }

    if (inside_points.length == 0) return [[], []];
    if (inside_points.length == 3) return [[in_tri], [in_tex]];

    if (inside_points.length == 1 && outside_points.length == 2) {
        let out_tri = matrix.create(3, 4);
        let out_tex = matrix.create(3, 3);

        out_tri[0] = inside_points[0];
        out_tex[0] = inside_tex[0];

        let t;
        [out_tri[1], t] = intersect_plane(plane_p, plane_n, inside_points[0], outside_points[0]);
        out_tex[1][0] = t * (outside_tex[0][0] - inside_tex[0][0]) + inside_tex[0][0];
        out_tex[1][1] = t * (outside_tex[0][1] - inside_tex[0][1]) + inside_tex[0][1];
        out_tex[1][2] = t * (outside_tex[0][2] - inside_tex[0][2]) + inside_tex[0][2];

        [out_tri[2], t] = intersect_plane(plane_p, plane_n, inside_points[0], outside_points[1]);
        out_tex[2][0] = t * (outside_tex[1][0] - inside_tex[0][0]) + inside_tex[0][0];
        out_tex[2][1] = t * (outside_tex[1][1] - inside_tex[0][1]) + inside_tex[0][1];
        out_tex[2][2] = t * (outside_tex[1][2] - inside_tex[0][2]) + inside_tex[0][2];

        return [[out_tri], [out_tex]];
    }

    if (inside_points.length == 2 && outside_points.length == 1) {
        let out_tri1_p = matrix.create(3, 4);
        let out_tri2_p = matrix.create(3, 4);
        let out_tri1_t = matrix.create(3, 3);
        let out_tri2_t = matrix.create(3, 3);

        out_tri1_p[0] = inside_points[0];
        out_tri1_p[1] = inside_points[1];
        out_tri1_t[0] = inside_tex[0];
        out_tri1_t[1] = inside_tex[1];

        let t;
        [out_tri1_p[2], t] = intersect_plane(plane_p, plane_n, inside_points[0], outside_points[0]);
        out_tri1_t[2][0] = t * (outside_tex[0][0] - inside_tex[0][0]) + inside_tex[0][0];
        out_tri1_t[2][1] = t * (outside_tex[0][1] - inside_tex[0][1]) + inside_tex[0][1];
        out_tri1_t[2][2] = t * (outside_tex[0][2] - inside_tex[0][2]) + inside_tex[0][2];

        out_tri2_p[0] = inside_points[1];
        out_tri2_p[1] = out_tri1_p[2];
        out_tri2_t[0] = inside_tex[1];
        out_tri2_t[1] = out_tri1_t[2];

        [out_tri2_p[2], t] = intersect_plane(plane_p, plane_n, inside_points[1], outside_points[0]);
        out_tri2_t[2][0] = t * (outside_tex[0][0] - inside_tex[1][0]) + inside_tex[1][0];
        out_tri2_t[2][1] = t * (outside_tex[0][1] - inside_tex[1][1]) + inside_tex[1][1];
        out_tri2_t[2][2] = t * (outside_tex[0][2] - inside_tex[1][2]) + inside_tex[1][2];

        // idk why you have to make a clone for it to work, but don't touch it! I spent many months fixing this :)
        return [[out_tri1_p, out_tri2_p], [structuredClone(out_tri1_t), structuredClone(out_tri2_t)]];
    }
}

/**
 * Returns the shortest distance from point to plane
 * @param {vector} plane_p plane
 * @param {vector} plane_n Normal on plane
 * @param {vector} p Point
 * @returns {vector}
 */
function dist(plane_p, plane_n, p) {
    return plane_n[0] * p[0] + plane_n[1] * p[1] + plane_n[2] * p[2] - vector.dp(plane_n, plane_p);
}