const vec_math = {
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
        return [v[0] / k, v[1] / k, v[2] / k, v[3]];
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
        return Math.sqrt(vec_math.dp(v, v));
    },

    /**
     * Normalizes a vector
     * @param {vector} v vector
     * @returns {vector} Normalized vector
     */
    norm: (v) => {
        const l = vec_math.len(v);
        return [v[0] / l, v[1] / l, v[2] / l];
    }
}

const mat_math = {

    /**
     * Creates a matrix (all zeros)
     * @param {integer} r number of rows in the matrix
     * @param {integer} c number of columns in the matrix
     * @returns {matrix} matrix
     */
    mat_create: (r, c) => {
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
    make_identity: () => {
        let m = mat_math.mat_create(4, 4);
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
        let m = mat_math.mat_create(4, 4);
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
     * @returns {matrix}
     */
    make_translation: (x, y, z) => {
        let m = mat_math.make_identity();
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
        let m = mat_math.mat_create(4, 4);
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
        let m = mat_math.mat_create(4, 4);
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
        let m = mat_math.mat_create(4, 4);
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
        let m = mat_math.mat_create(4, 4);

        m[0][0] = aspectRatio * fovRad;
        m[1][1] = fovRad;
        m[2][2] = far / (far - near);
        m[2][3] = 1;
        m[3][2] = (-far * near) / (far - near);

        return m;
    }
}