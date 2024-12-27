const canvas = document.querySelector("#c");
const ctx = canvas.getContext("2d");

canvas.width = 512;
canvas.height = 512;

// Program Parameters
let fov = 40;
let aspect_ratio = canvas.width / canvas.height;
let near_plane = 0.1;
let far_plane = 500;
let fps = 60;
let draw_wireframe = false;
let debug_mode = true;
let backface_culling = true;
let texture = new Texture("/scenes/textures/spyro-the-dragon.png");

let rotation = [0, 3, 3];
let light_dir = [-1, -1, 0];
let cam_loc = [0, 0, 0];

let vert_times = [];
let frag_times = [];

// Program Data
let data = [];
let data_uv = [];
let tri_buffer = [];
let tex_buffer = [];
let light_buffer = [];
let depth_buffer = matrix.create(canvas.width, canvas.height);
let c_buffer = ctx.createImageData(canvas.width, canvas.height);

let frame_counter = 0;

// Pre-calculation
let cam_up, cam_look_dir, cam_target
let world_mat, view_mat, proj_mat;
let planes;

recalculate();
function recalculate() {
    cam_up = vector.add(cam_loc, [0, 1, 0]);
    cam_look_dir = vector.add(cam_loc, [0, 0, 1]);
    cam_target = vector.add(cam_loc, cam_look_dir);

    world_mat = matrix.calc_world_mat(rotation);
    view_mat = matrix.calc_view_mat(cam_loc, cam_target, cam_up);
    proj_mat = matrix.projection(fov, aspect_ratio, near_plane, far_plane);

    planes = [
        [[cam_loc[0], cam_loc[1], near_plane], [cam_loc[0], cam_loc[1], 1]],    // near
        [[cam_loc[0], cam_loc[1], far_plane], [cam_loc[0], cam_loc[1], -1]],    // far
        [cam_loc, vector.add(cam_loc, [-1, 0, 1])],                             // right
        [cam_loc, vector.add(cam_loc, [1, 0, 1])],                              // left
        [cam_loc, vector.add(cam_loc, [0, 1, 1])],                              // top
        [cam_loc, vector.add(cam_loc, [0, -1, 1])],                             // bottom
    ];
}

// User Input
document.addEventListener("keydown", ({ key }) => {
    switch (key) {
        case "1": {
            rotation[0] += 0.1;
            world_mat = matrix.calc_world_mat(rotation);
            break;
        }

        case "2": {
            rotation[1] += 0.1;
            world_mat = matrix.calc_world_mat(rotation);
            break;
        }

        case "3": {
            rotation[2] += 0.1;
            world_mat = matrix.calc_world_mat(rotation);
            break;
        }

        case "w": {
            cam_loc = vector.add(cam_loc, vector.mul(cam_look_dir, 8));
            recalculate();
            break;
        }

        case "a": {
            rotation[1] += 0.1;
            recalculate();
            break;
        }

        case "s": {
            cam_loc = vector.sub(cam_loc, vector.mul(cam_look_dir, 8));
            recalculate();
            break;
        }

        case "d": {
            rotation[1] -= 0.1;
            recalculate();
            break;
        }
    }
});

// Track Performance
calc_performance();
function calc_performance() {
    setTimeout(() => {
        if (debug_mode) {
            let i;
            
            let vert_avg = 0;
            for (i = 0; i < vert_times.length; i++) vert_avg += vert_times[i];
            vert_avg /= i;

            let frag_avg = 0;
            for (i = 0; i < frag_times.length; i++) frag_avg += frag_times[i];
            frag_avg /= i;

            console.log(`Frames Per Second: ${frame_counter}\nVertex Shader Time: ${vert_avg}\nFragment Shader Time: ${frag_avg}`);
        }

        frame_counter = 0;
        vert_times = [];
        frag_times = [];
        calc_performance();
    }, 1000);
}

// Render Loop
(async () => {
    test_app(); // tests/main.test.js

    await texture.init();
    render_loop();
})();

function render_loop() {
    if (debug_mode) {

        // Call Vertex Shader (runs once per triangle)
        let vert_begin = performance.now();
        for (let i = 0; i < data.length; i++) {
            vertex_shader(i);
        }
        let vert_end = performance.now();
    
        // Call Fragment Shader
        let frag_begin = performance.now();
        if (data_uv.length != 0) {
            for (let i = 0; i < tri_buffer.length; i++) {
                draw_triangle(i, tri_buffer[i], tex_buffer[i], depth_buffer, fragment_shader);
            }
        }
        let frag_end = performance.now();
    
        vert_times.push(vert_end - vert_begin);
        frag_times.push(frag_end - frag_begin);
    } else {
        // Call Vertex Shader (runs once per triangle)
        for (let i = 0; i < data.length; i++) {
            vertex_shader(i);
        }
    
        // Call Fragment Shader
        if (data_uv.length != 0) {
            for (let i = 0; i < tri_buffer.length; i++) {
                draw_triangle(i, tri_buffer[i], tex_buffer[i], depth_buffer, fragment_shader);
            }
        }
    }

    // Draw wireframe
    ctx.putImageData(c_buffer, 0, 0);
    if (draw_wireframe) wireframe(ctx, tri_buffer);

    // Reset
    tri_buffer = [];
    tex_buffer = [];
    light_buffer = [];
    depth_buffer = matrix.create(canvas.width, canvas.height);
    c_buffer = ctx.createImageData(canvas.width, canvas.height);

    // Wait till next frame
    frame_counter++;
    setTimeout(() => {
        render_loop();
    }, 1000 / fps);
}

function vertex_shader(i) {
    let proj_tri = structuredClone(data[i]);
    let proj_tex = structuredClone(data_uv[i]);

    // Model Space -> World Space
    proj_tri[0] = matrix.mult_vec(world_mat, proj_tri[0]);
    proj_tri[1] = matrix.mult_vec(world_mat, proj_tri[1]);
    proj_tri[2] = matrix.mult_vec(world_mat, proj_tri[2]);

    // Scene offset (temporary)
    // proj_tri[0][2] += 3;
    // proj_tri[1][2] += 3;
    // proj_tri[2][2] += 3;

    // Calculate triangle normal
    let l1 = vector.sub(proj_tri[1], proj_tri[0]);
    let l2 = vector.sub(proj_tri[2], proj_tri[0]);
    let norm = vector.norm(vector.cp(l1, l2));

    // Only render if the triangle is facing the camera

    if (vector.dp(norm, vector.sub(proj_tri[0], cam_loc)) < 0 || backface_culling) {

        // Calculate Global Illumination
        let shadow = Math.min(1, Math.max(0.5, vector.dp(light_dir, norm)));

        // World Space -> View Space
        proj_tri[0] = matrix.mult_vec(view_mat, proj_tri[0]);
        proj_tri[1] = matrix.mult_vec(view_mat, proj_tri[1]);
        proj_tri[2] = matrix.mult_vec(view_mat, proj_tri[2]);

        // Clip triangles
        // todo: add side clipping plane
        let clip_tri = [structuredClone(proj_tri)];
        let clip_tex = [structuredClone(proj_tex)];

        let temp_tris = [];
        let temp_texs = [];

        for (let i = 0; i < planes.length; i++) {
            temp_tris = [];
            temp_texs = [];

            for (let j = 0; j < clip_tri.length; j++) {
                let [temp_tri, temp_tex] = clip(planes[i][0], planes[i][1], clip_tri[j], clip_tex[j]);

                temp_tris.push(...temp_tri);
                temp_texs.push(...temp_tex);
            }

            clip_tri = structuredClone(temp_tris);
            clip_tex = structuredClone(temp_texs);
        }

        for (let i = 0; i < clip_tri.length; i++) {
            proj_tri = clip_tri[i];
            proj_tex = clip_tex[i];

            // View Space -> Projected Space
            proj_tri[0] = matrix.mult_vec(proj_mat, proj_tri[0]);
            proj_tri[1] = matrix.mult_vec(proj_mat, proj_tri[1]);
            proj_tri[2] = matrix.mult_vec(proj_mat, proj_tri[2]);

            // UV Perspective Correcting
            proj_tex[0][0] /= proj_tri[0][3];
            proj_tex[1][0] /= proj_tri[1][3];
            proj_tex[2][0] /= proj_tri[2][3];

            proj_tex[0][1] /= proj_tri[0][3];
            proj_tex[1][1] /= proj_tri[1][3];
            proj_tex[2][1] /= proj_tri[2][3];

            proj_tex[0][2] = 1 / proj_tri[0][3];
            proj_tex[1][2] = 1 / proj_tri[1][3];
            proj_tex[2][2] = 1 / proj_tri[2][3];

            // Model Perspective Correcting
            proj_tri[0] = vector.div(proj_tri[0], proj_tri[0][3]);
            proj_tri[1] = vector.div(proj_tri[1], proj_tri[1][3]);
            proj_tri[2] = vector.div(proj_tri[2], proj_tri[2][3]);

            // Normalised Coordinates -> Screen Coordinates
            proj_tri[0][0] = Math.round(proj_tri[0][0] * 100 + canvas.width / 2);
            proj_tri[1][0] = Math.round(proj_tri[1][0] * 100 + canvas.width / 2);
            proj_tri[2][0] = Math.round(proj_tri[2][0] * 100 + canvas.width / 2);

            proj_tri[0][1] = Math.round(proj_tri[0][1] * 100 + canvas.height / 2);
            proj_tri[1][1] = Math.round(proj_tri[1][1] * 100 + canvas.height / 2);
            proj_tri[2][1] = Math.round(proj_tri[2][1] * 100 + canvas.height / 2);

            // Store Data
            tri_buffer.push(proj_tri);
            tex_buffer.push(proj_tex);
            light_buffer.push(shadow);
        }
    }
}

function fragment_shader(tri_id, x, y, tex_u, tex_v) {
    // Find pixel color
    let color = texture.get_pixel(tex_u, tex_v);

    // Apply global illumination
    color = vector.mul(color, light_buffer[tri_id]);

    // Set color buffer
    set_color(
        color,
        [x, y],
        c_buffer
    );
}