const vector = {
    /**
     * Add 2 vectors together
     * @param {vector} v1 vector 1
     * @param {vector} v2 vector 2
     * @returns {vector} sum of vectors
     */
    add: (v1, v2) => {
        return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
    },

    /**
     * Substracts 2 vectors from each other
     * @param {vector} v1 vector 1
     * @param {vector} v2 vector 2
     * @returns {vector} differance of vectors
     */
    sub: (v1, v2) => {
        return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
    },

    /**
     * Divides a vector from an integer
     * @param {vector} v vector
     * @param {integer} k integer
     * @returns {vector} vector
     */
    div: (v, k) => {
        return [v[0] / k, v[1] / k, v[2] / k];
    },

    /**
     * Multiplies a vector and an integer
     * @param {vector} v vector
     * @param {integer} k integer
     * @returns {vector} vector
     */
    mul: (v, k) => {
        return [v[0] * k, v[1] * k, v[2] * k];
    },

    /**
     * Performs dot product on 2 vectors
     * @param {vector} v1 vector 1 
     * @param {vector} v2 vector 2
     * @returns {integer} Dot product of 2 vectors
     */
    dp: (v1, v2) => {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    },

    /**
     * Performs cross product on 2 vectors
     * @param {vector} v1 vector 1
     * @param {vector} v2 vector 2
     * @returns {vector} Cross product of 2 vectors
     */
    cp: (v1, v2) => {
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    },

    /**
     * Returns length of a vector
     * @param {vector} v vector
     * @returns {integer} lenth of the vector
     */
    len: (v) => {
        return Math.sqrt(vector.dp(v, v));
    },

    /**
     * Normalizes a vector
     * @param {vector} v vector
     * @returns {vector} Normalized vector
     */
    norm: (v) => {
        const l = vector.len(v);
        return [v[0] / l, v[1] / l, v[2] / l];
    },

    /**
     * Formats a vector into a string
     * @param {vector} v vector
     * @returns {string} Formatted vector
     */
    format: (v) => {
        return "[" + v.join(", ") + "]";
    }
}

const matrix = {

    /**
     * Creates a matrix (all zeros)
     * @param {integer} r number of rows in the matrix
     * @param {integer} c number of columns in the matrix
     * @returns {matrix} matrix
     */
    create: (r, c) => {
        let m = [];

        for (let i = 0; i < r; i++) {
            let temp = [];
            for (let j = 0; j < c; j++) {
                temp.push(0);
            }
            m.push(temp);
        }

        return m;
    },

    /**
     * Creates a matrix identity
     * @returns {matrix} matrix identity
     */
    identity: () => {
        let m = matrix.create(4, 4);
        m[0][0] = 1;
        m[1][1] = 1;
        m[2][2] = 1;
        m[3][3] = 1;

        return m;
    },

    /**
     * Multiplies a matrix with a vector
     * @param {matrix} m matrix
     * @param {vector} i vector
     * @returns {matrix} Product
     */
    mult_vec: (m, i) => {
        if (!m[3]) m[3] = [0, 0, 0];
        if (!i[3]) i[3] = 0;

        return [
            i[0] * m[0][0] + i[1] * m[1][0] + i[2] * m[2][0] + i[3] * m[3][0],
            i[0] * m[0][1] + i[1] * m[1][1] + i[2] * m[2][1] + i[3] * m[3][1],
            i[0] * m[0][2] + i[1] * m[1][2] + i[2] * m[2][2] + i[3] * m[3][2],
            i[0] * m[0][3] + i[1] * m[1][3] + i[2] * m[2][3] + i[3] * m[3][3],
        ];
    },

    /**
     * Multiples a matrix with a matrix
     * @param {matrix} m1 matrix
     * @param {matrix} m2 matrix
     * @returns {matrix} product of matrices
     */
    mult_mat: (m1, m2) => {
        let m = matrix.create(4, 4);
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                m[r][c] =
                    m1[r][0] * m2[0][c] +
                    m1[r][1] * m2[1][c] +
                    m1[r][2] * m2[2][c] +
                    m1[r][3] * m2[3][c]
            }
        }

        return m;
    },

    /**
     * Creates a translation matrix
     * @param {integer} x 
     * @param {integer} y 
     * @param {integer} z 
     * @returns {matrix} Translation matrix
     */
    translate: (x, y, z) => {
        let m = matrix.identity();
        m[3][0] = x;
        m[3][1] = y;
        m[3][2] = z;

        return m;
    },

    /**
     * Creates a rotation matrix for the x axis
     * @param {integer} angle 
     * @returns {matrix}
     */
    rot_x: (angle) => {
        let m = matrix.create(4, 4);
        m[0][0] = 1;
        m[1][1] = Math.cos(angle);
        m[1][2] = Math.sin(angle);
        m[2][1] = -Math.sin(angle);
        m[2][2] = Math.cos(angle);
        m[3][3] = 1;

        return m;
    },

    /**
     * Creates a rotation matrix for the y axis
     * @param {integer} angle 
     * @returns {matrix}
     */
    rot_y: (angle) => {
        let m = matrix.create(4, 4);
        m[0][0] = Math.cos(angle);
        m[0][2] = Math.sin(angle);
        m[1][1] = 1;
        m[2][0] = -Math.sin(angle);
        m[2][2] = Math.cos(angle);
        m[3][3] = 1;

        return m;
    },

    /**
     * Creates a rotation matrix for the z axis
     * @param {integer} angle 
     * @returns {matrix}
     */
    rot_z: (angle) => {
        let m = matrix.create(4, 4);

        m[0][0] = Math.cos(angle);
        m[0][1] = Math.sin(angle);
        m[1][0] = -Math.sin(angle);
        m[1][1] = Math.cos(angle);
        m[2][2] = 1;
        m[3][3] = 1;

        return m;
    },

    /**
     * Creates a projection matrix
     * @param {integer} fov Field of view
     * @param {integer} aspectRatio Aspect ratio
     * @param {integer} near Near clipping plane
     * @param {integer} far Far clipping plane
     * @returns {matrix}
     */
    projection: (fov, aspectRatio, near, far) => {
        const fovRad = 1 / Math.tan(fov * 0.5 / 180 * Math.PI);
        let m = matrix.create(4, 4);

        m[0][0] = aspectRatio * fovRad;
        m[1][1] = fovRad;
        m[2][2] = far / (far - near);
        m[2][3] = 1;
        m[3][2] = (-far * near) / (far - near);

        return m;
    },

    /**
     * Creates an view matrix
     * @param {vector} pos position of camera
     * @param {vector} target the point the camera is looking at
     * @param {vector} up point directly ontop of the camera
     */
    calc_view_mat: (pos, target, up) => {
        // Calc camera matrix
        let new_forward = vector.norm(vector.sub(target, pos));
        let a = vector.mul(new_forward, vector.dp(up, new_forward));
        let new_up = vector.norm(vector.sub(up, a));
        let new_right = vector.cp(up, new_forward);

        let cam_mat = [];
        cam_mat[0] = [   new_right[0],   new_right[1],   new_right[2], 0];
        cam_mat[1] = [      new_up[0],      new_up[1],      new_up[2], 0];
        cam_mat[2] = [ new_forward[0], new_forward[1], new_forward[2], 0];
        cam_mat[3] = [         pos[0],         pos[1],         pos[2], 0];

        // Invert to get view matrix
        let view_mat = matrix.create(4, 4);
        view_mat[0][0] = cam_mat[0][0];
        view_mat[0][1] = cam_mat[1][0];
        view_mat[0][2] = cam_mat[2][0];
        view_mat[0][3] = 0;

        view_mat[1][0] = cam_mat[0][1];
        view_mat[1][1] = cam_mat[1][1];
        view_mat[1][2] = cam_mat[2][1];
        view_mat[1][3] = 0;

        view_mat[2][0] = cam_mat[0][2];
        view_mat[2][1] = cam_mat[1][2];
        view_mat[2][2] = cam_mat[2][2];
        view_mat[2][3] = 0;

        view_mat[3][0] = -(cam_mat[3][0] * view_mat[0][0] + cam_mat[3][1] * view_mat[1][0] + cam_mat[3][2] * view_mat[2][0]);
        view_mat[3][1] = -(cam_mat[3][0] * view_mat[0][1] + cam_mat[3][1] * view_mat[1][1] + cam_mat[3][2] * view_mat[2][1]);
        view_mat[3][2] = -(cam_mat[3][0] * view_mat[0][2] + cam_mat[3][1] * view_mat[1][2] + cam_mat[3][2] * view_mat[2][2]);
        view_mat[3][3] = 1;

        return view_mat;
    },

    /**
     * Calculates the world matrix
     * @param {vector} rot rotation of scene
     * @returns {matrix}
     */
    calc_world_mat: (rot) => {
        let world_mat = matrix.mult_mat(matrix.rot_x(rot[0]), matrix.rot_y(rot[1]));
        world_mat = matrix.mult_mat(world_mat, matrix.rot_z(rot[2]));
        return world_mat;
    },

    /**
     * Formats a matrix into a string
     * @param {matrix} matrix
     * @returns {string} formatted string
     */
    format: (mat) => {
        let out = "[";
        for (let i = 0; i < mat.length; i++) {
            out += "[" + mat[i].join(", ");

            if (mat[i + 1]) {
                out += "], ";
            } else {
                out += "]";
            }
        }
        
        out += "]";
        return out;
    }
}