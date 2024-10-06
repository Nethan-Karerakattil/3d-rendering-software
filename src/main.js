const canvas = document.querySelector("#c");
const ctx = canvas.getContext("2d");

canvas.width = 512;
canvas.height = 512;

let data = [];
let data_uv = [];

let fov = 90;
let aspectRatio = canvas.width / canvas.height;
let near_plane = 0.1;
let far_plane = 1000;
let fps = 60;
let true_fps = 0;
let draw_wireframe = false;
let camera_loc = [0, 0, 0];
let texture = new Texture("box-texture.jpg");
let c_buffer = ctx.createImageData(canvas.width, canvas.height);

let proj_tris = [];
let proj_texs = [];

let rotation = [0, 0, 0];
let world_mat = calc_world_mat(rotation);
let proj_mat = mat_math.projection(fov, aspectRatio, near_plane, far_plane);

document.addEventListener("keydown", ({ key }) => {
    switch(key) {
        case "1":
            rotation[0] += 0.1;
            world_mat = calc_world_mat(rotation);
            break;

        case "2":
            rotation[1] += 0.1;
            world_mat = calc_world_mat(rotation);
            break;

        case "3":
            rotation[2] += 0.1;
            world_mat = calc_world_mat(rotation);
            break;
    }
});

(async () => {
    await texture.init();
    render_loop();
})();

calc_fps();
function calc_fps() {
    setTimeout(() => {
        console.log(true_fps);
        true_fps = 0;
        calc_fps();
    }, 1000);
}

function render_loop() {
    // Call Vertex Shader
    for (let i = 0; i < data.length; i++) {
        vertex_shader(i);
    }

    // Call Fragment Shader
    for (let i = 0; i < proj_tris.length; i++) draw_triangle(proj_tris[i], proj_texs[i], fragment_shader);

    // Draw
    ctx.putImageData(c_buffer, 0, 0);
    if (draw_wireframe) wireframe(ctx, proj_tris);

    // Reset
    proj_tris = [];
    proj_texs = [];
    c_buffer = ctx.createImageData(canvas.width, canvas.height);

    // Wait till next frame
    true_fps++;
    setTimeout(() => {
        render_loop();
    }, 1000 / fps);
}

function vertex_shader(i) {
    let proj_tri = [];
    let proj_tex = structuredClone(data_uv[i]);

    // Model Space -> World Space
    proj_tri[0] = mat_math.mult_vec(world_mat, data[i][0]);
    proj_tri[1] = mat_math.mult_vec(world_mat, data[i][1]);
    proj_tri[2] = mat_math.mult_vec(world_mat, data[i][2]);

    proj_tri[0][2] += 3;
    proj_tri[1][2] += 3;
    proj_tri[2][2] += 3;

    // Calculate Normal
    let l1 = vec_math.sub(proj_tri[1], proj_tri[0]);
    let l2 = vec_math.sub(proj_tri[2], proj_tri[0]);
    let norm = vec_math.norm(vec_math.cp(l1, l2));

    if (vec_math.dp(norm, vec_math.sub(proj_tri[0], camera_loc)) < 0) {

        // 3d -> 2d
        proj_tri[0][3] = 1;
        proj_tri[1][3] = 1;
        proj_tri[2][3] = 1;

        proj_tri[0] = mat_math.mult_vec(proj_mat, proj_tri[0]);
        proj_tri[1] = mat_math.mult_vec(proj_mat, proj_tri[1]);
        proj_tri[2] = mat_math.mult_vec(proj_mat, proj_tri[2]);

        // Perspective
        proj_tri[0] = vec_math.div(proj_tri[0], proj_tri[0][3]);
        proj_tri[1] = vec_math.div(proj_tri[1], proj_tri[1][3]);
        proj_tri[2] = vec_math.div(proj_tri[2], proj_tri[2][3]);

        proj_tex[0][0] /= proj_tri[0][3];
        proj_tex[1][0] /= proj_tri[1][3];
        proj_tex[2][0] /= proj_tri[2][3];

        proj_tex[0][1] /= proj_tri[0][3];
        proj_tex[1][1] /= proj_tri[1][3];
        proj_tex[2][1] /= proj_tri[2][3];

        proj_tex[0][2] = 1 / proj_tri[0][3];
        proj_tex[1][2] = 1 / proj_tri[1][3];
        proj_tex[2][2] = 1 / proj_tri[2][3];

        // Scale up points
        proj_tri[0][0] = Math.round(proj_tri[0][0] * 100 + canvas.width / 2);
        proj_tri[1][0] = Math.round(proj_tri[1][0] * 100 + canvas.width / 2);
        proj_tri[2][0] = Math.round(proj_tri[2][0] * 100 + canvas.width / 2);

        proj_tri[0][1] = Math.round(proj_tri[0][1] * 100 + canvas.height / 2);
        proj_tri[1][1] = Math.round(proj_tri[1][1] * 100 + canvas.height / 2);
        proj_tri[2][1] = Math.round(proj_tri[2][1] * 100 + canvas.height / 2);

        proj_tris.push(proj_tri);
        proj_texs.push(proj_tex);
    }
}

function fragment_shader(x, y, tex_u, tex_v) {
    set_color(
        texture.get_pixel(tex_u, tex_v),
        [x, y],
        c_buffer
    );
}