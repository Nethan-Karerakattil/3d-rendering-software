const canvas = document.querySelector("#c");
const ctx = canvas.getContext("2d");

canvas.width = 512;
canvas.height = 512;

// Program Parameters
let fov = 90;
let aspect_ratio = canvas.width / canvas.height;
let near_plane = 0.1;
let far_plane = 1000;
let fps = 60;
let draw_wireframe = false;
let show_fps = false;
let texture = new Texture("/scenes/textures/box-2.jpg");

let rotation = [0, 0, 0];
let light_dir = [0, 1, -1];
let cam_loc = [0, 0, 0];
let cam_up = [0, 1, 0];
let cam_look_dir = [0, 0, 1];

// Program Data
let data = [];
let data_uv = [];
let proj_tris = [];
let proj_texs = [];
let tri_lighting = [];

let c_buffer = ctx.createImageData(canvas.width, canvas.height);
let frame_counter = 0;

// Pre-calculation
let world_mat = matrix.calc_world_mat(rotation);
let proj_mat = matrix.projection(fov, aspect_ratio, near_plane, far_plane);

// User Input
document.addEventListener("keydown", ({ key }) => {
    switch (key) {
        case "1":
            rotation[0] += 0.1;
            world_mat = matrix.calc_world_mat(rotation);
            break;

        case "2":
            rotation[1] += 0.1;
            world_mat = matrix.calc_world_mat(rotation);
            break;

        case "3":
            rotation[2] += 0.1;
            world_mat = matrix.calc_world_mat(rotation);
            break;
    }
});

// Calculate FPS
calc_fps();
function calc_fps() {
    setTimeout(() => {
        if (show_fps) console.log(frame_counter);
        frame_counter = 0;
        calc_fps();
    }, 1000);
}

// Render Loop
(async () => {
    test_app(); // tests/main.test.js

    await texture.init();
    render_loop();
})();

function render_loop() {

    // Call Vertex Shader (runs once per triangle)
    for (let i = 0; i < data.length; i++) {
        vertex_shader(i);
    }

    // Call Fragment Shader
    if (data_uv.length != 0) {
        for (let i = 0; i < proj_tris.length; i++) {
            draw_triangle(i, proj_tris[i], proj_texs[i], fragment_shader);
        }
    }

    // Draw wireframe
    ctx.putImageData(c_buffer, 0, 0);
    if (draw_wireframe) wireframe(ctx, proj_tris);

    // Reset
    proj_tris = [];
    proj_texs = [];
    tri_lighting = [];
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
    proj_tri[0][2] += 3;
    proj_tri[1][2] += 3;
    proj_tri[2][2] += 3;

    // Calculate triangle normal
    let l1 = vector.sub(proj_tri[1], proj_tri[0]);
    let l2 = vector.sub(proj_tri[2], proj_tri[0]);
    let norm = vector.norm(vector.cp(l1, l2));

    // Only render the triangle is facing the camera
    if (vector.dp(norm, vector.sub(proj_tri[0], cam_loc)) < 0) {

        // Calculate Global Illumination
        let shadow = Math.min(1, Math.max(0, vector.dp(light_dir, norm)));

        // Clip triangles
        // todo: add sides and far clipping plane
        let [clip_tri, clip_tex] = clip([0, 0, near_plane], [0, 0, 1], proj_tri, proj_tex);

        for (let i = 0; i < clip_tri.length; i++) {
            proj_tri = clip_tri[i];
            proj_tex = clip_tex[i];

            // // World Space -> View Space
            // proj_tri[0] = matrix.mult_vec(view_mat, proj_tri[0]);
            // proj_tri[1] = matrix.mult_vec(view_mat, proj_tri[1]);
            // proj_tri[2] = matrix.mult_vec(view_mat, proj_tri[2]);

            // View Space -> Projected Space
            proj_tri[0] = matrix.mult_vec(proj_mat, proj_tri[0]);
            proj_tri[1] = matrix.mult_vec(proj_mat, proj_tri[1]);
            proj_tri[2] = matrix.mult_vec(proj_mat, proj_tri[2]);

            // Texture Perspective
            proj_tex[0][0] /= proj_tri[0][3];
            proj_tex[1][0] /= proj_tri[1][3];
            proj_tex[2][0] /= proj_tri[2][3];

            proj_tex[0][1] /= proj_tri[0][3];
            proj_tex[1][1] /= proj_tri[1][3];
            proj_tex[2][1] /= proj_tri[2][3];

            proj_tex[0][2] = 1 / proj_tri[0][3];
            proj_tex[1][2] = 1 / proj_tri[1][3];
            proj_tex[2][2] = 1 / proj_tri[2][3];

            // Triangle Perspective
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
            proj_tris.push(proj_tri);
            proj_texs.push(proj_tex);
            tri_lighting.push(shadow);
        }
    }
}

function fragment_shader(tri_id, x, y, tex_u, tex_v) {
    // Find pixel color
    let color = texture.get_pixel(tex_u, tex_v);

    // Apply global illumination
    color = vector.mul(color, tri_lighting[tri_id]);

    // Set color buffer
    set_color(
        color,
        [x, y],
        c_buffer
    );
}