import type { Mat2 } from '@/math/linalg'
import type { ContentModule } from './types'

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol
const same = (m: Mat2, target: Mat2, tol = 0.01) => m.every((x, i) => near(x, target[i], tol))

/** Singular values of a 2×2 matrix: how much it stretches its longest and shortest directions. */
function singularValues([a, b, c, d]: Mat2): [number, number] {
  const s = a * a + b * b + c * c + d * d
  const det = Math.abs(a * d - b * c)
  const root = Math.sqrt(Math.max(0, s * s - 4 * det * det))
  return [Math.sqrt((s + root) / 2), Math.sqrt(Math.max(0, (s - root) / 2))]
}

const content: ContentModule = {
  'change-of-basis': {
    hook: 'A point does not come with coordinates attached. “2 east, 1 north” and “1.5 steps along the road, 1 step along the side street” can describe the **same** spot, measured with different rulers. Changing basis means translating between such descriptions, and picking a good basis can make a hard problem easy.',
    explore: {
      type: 'matrix',
      props: {
        matrix: [2, 1, 0, 1],
        vector: [0.5, 2],
        snap: 0.5,
        extent: 4.5,
        controls: 'compact',
      },
      caption:
        'The green and red arrows are a new basis $\\mathbf b_1, \\mathbf b_2$ (the columns of $P$). The draggable vector holds coordinates $(c_1, c_2)$; its image $P\\mathbf c$ is where that point really is.',
      tryThis: [
        {
          id: 't-land',
          text: 'Choose coordinates that land the point at $(4, 1)$ in the standard grid.',
          when: (s) =>
            s.image !== undefined && near(s.image[0], 4, 0.01) && near(s.image[1], 1, 0.01),
        },
        {
          id: 't-tilted',
          text: 'Make the basis $\\mathbf b_1 = (1, 1)$, $\\mathbf b_2 = (-1, 1)$: the grid turned by $45°$.',
          when: (s) => same(s.matrix, [1, -1, 1, 1]),
        },
        {
          id: 't-standard',
          text: 'Go back to the standard basis. When are the two sets of coordinates the same?',
          when: (s) => same(s.matrix, [1, 0, 0, 1]),
        },
      ],
    },
    explain:
      'Put the new basis vectors in the columns of a matrix $P$. If a point has coordinates $\\mathbf c$ in the new basis, its standard coordinates are $\\mathbf x = P\\mathbf c$. Going the other way needs the inverse: $\\mathbf c = P^{-1}\\mathbf x$.\n\nA transformation $A$ written in the new basis becomes $P^{-1}AP$: translate into standard coordinates, apply $A$, translate back. The payoff comes when the new basis is made of eigenvectors: then $P^{-1}AP$ is **diagonal**, and the transformation is just stretching along each new axis.',
    formula: {
      tex: "\\mathbf x = P\\mathbf c, \\qquad \\mathbf c = P^{-1}\\mathbf x, \\qquad A' = P^{-1}AP",
      caption: 'Same arrow, different rulers.',
    },
    misconception:
      'Changing basis does not move any points. It only changes the numbers we use to name them.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-std',
        prompt:
          'With $\\mathbf b_1 = (1, 1)$ and $\\mathbf b_2 = (1, -1)$, which point has new coordinates $(3, 1)$?',
        options: [
          { text: '$(4, 2)$', correct: true },
          { text: '$(3, 1)$', why: 'That would be in the standard basis.' },
          { text: '$(2, 4)$', why: '$3(1, 1) + 1(1, -1) = (4, 2)$.' },
        ],
        explain: '$3\\mathbf b_1 + 1\\mathbf b_2 = (3 + 1, 3 - 1) = (4, 2)$.',
      },
      {
        kind: 'numeric',
        id: 'c-coord',
        prompt:
          'Same basis. The point $(6, 2)$ is $c_1\\mathbf b_1 + c_2\\mathbf b_2$. What is $c_1$?',
        answer: 4,
        hint: 'Solve $c_1 + c_2 = 6$ and $c_1 - c_2 = 2$.',
        explain: 'Adding the equations gives $2c_1 = 8$.',
      },
      {
        kind: 'mcq',
        id: 'c-diag',
        prompt: 'Why change to a basis of eigenvectors?',
        options: [
          { text: 'The matrix becomes diagonal: pure stretching along each axis', correct: true },
          {
            text: 'The determinant becomes 1',
            why: 'The determinant never changes under a change of basis.',
          },
          { text: 'The vectors get shorter', why: 'Lengths are not the point; simplicity is.' },
        ],
        explain: 'In its eigenbasis, a transformation only scales each basis vector.',
      },
    ],
    realWorld: [
      {
        title: 'Colour spaces',
        body: 'Images are stored in RGB but compressed in YCbCr (brightness + colour differences): a change of basis that lets JPEG throw away detail the eye won’t miss.',
      },
      {
        title: 'Robotics',
        body: 'A robot arm converts between the frame of each joint and the world frame dozens of times per movement.',
      },
    ],
    takeaways: [
      'Coordinates depend on the basis; the point does not.',
      '$\\mathbf x = P\\mathbf c$, with the new basis in the columns of $P$.',
      'In an eigenbasis, a transformation becomes diagonal.',
    ],
  },

  'least-squares': {
    hook: 'You have 16 measurements and a straight-line model with 2 numbers. No line passes through every point, so the equations have **no solution**. Least squares finds the best compromise: the line whose total squared error is as small as possible, and it does so with a beautiful bit of geometry, a perpendicular drop.',
    explore: {
      type: 'data',
      props: {
        mode: 'scatter',
        dataset: 'study',
        show: { userLine: true, residuals: true, squares: true },
        toggles: true,
        editable: false,
      },
      caption:
        'Drag your purple line. The squares show each point’s squared error; their total is the SSE. Then reveal the best fit.',
      tryThis: [
        {
          id: 't-tilt',
          text: 'Your line starts flat. Tilt it to follow the trend (a slope of at least 3) and watch the squares shrink.',
          when: (s) => s.userSlope !== undefined && s.userSlope >= 3,
        },
        {
          id: 't-close',
          text: 'Get your SSE within 10% of the best possible.',
          when: (s) => s.userSse !== undefined && s.userSse <= s.sse * 1.1,
        },
        {
          id: 't-best',
          text: 'Now within 1%. Compare your slope with the best-fit slope.',
          when: (s) => s.userSse !== undefined && s.userSse <= s.sse * 1.01,
        },
      ],
    },
    explain:
      'Writing $y = mx + b$ for every point gives a system $A\\mathbf x = \\mathbf y$ with more equations than unknowns. Usually $\\mathbf y$ is not in the column space of $A$, so there is no exact solution.\n\nThe best we can do is the point $A\\hat{\\mathbf x}$ of the column space **closest** to $\\mathbf y$: the perpendicular projection. Perpendicular means the error $\\mathbf y - A\\hat{\\mathbf x}$ is orthogonal to every column of $A$, so $A^T(\\mathbf y - A\\hat{\\mathbf x}) = 0$. That gives the **normal equations**, which minimise the sum of squared errors.',
    formula: {
      tex: 'A^T A\\,\\hat{\\mathbf x} = A^T \\mathbf y',
      caption: 'The normal equations: the error is perpendicular to the columns.',
    },
    misconception:
      'Least squares does not minimise the distance from points to the line measured at right angles; it minimises the vertical errors.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-why',
        prompt: 'Why is the best-fit error vector perpendicular to the column space?',
        options: [
          {
            text: 'The shortest path from a point to a plane meets it at a right angle',
            correct: true,
          },
          { text: 'Because the errors add to zero', why: 'That is a consequence, not the reason.' },
          { text: 'It is a convention', why: 'It follows from minimising the length.' },
        ],
        explain: 'Projection: the closest point is reached by dropping a perpendicular.',
      },
      {
        kind: 'numeric',
        id: 'c-mean',
        prompt:
          'Fitting just a constant $y = c$ to the data 2, 4, 9, what $c$ minimises the squared error?',
        answer: 5,
        explain: 'For a constant model, least squares gives the mean: $(2 + 4 + 9)/3 = 5$.',
      },
      {
        kind: 'numeric',
        id: 'c-sse',
        prompt: 'A line has residuals $2, -1, -1$. What is its SSE?',
        answer: 6,
        explain: '$4 + 1 + 1 = 6$.',
      },
    ],
    realWorld: [
      {
        title: 'GPS',
        body: 'Your phone hears more satellites than it needs and solves for its position by least squares.',
      },
      {
        title: 'Science everywhere',
        body: 'Fitting a model to measurements, from planetary orbits (Gauss, 1801) to drug doses, is least squares.',
      },
    ],
    takeaways: [
      'Too many equations: no exact solution, so minimise the squared error.',
      'The best fit is a projection; the error is perpendicular to the columns.',
      'Solve $A^TA\\hat{\\mathbf x} = A^T\\mathbf y$.',
    ],
  },

  svd: {
    hook: 'Every matrix, however messy, does just three simple things in a row: **rotate, stretch along the axes, rotate again**. That decomposition, the SVD, reveals a matrix’s most important directions, and is how computers compress images and find patterns in huge tables of data.',
    explore: {
      type: 'matrix',
      props: {
        matrix: [1.5, 1, 0.5, 1],
        showCircle: true,
        showSvd: true,
        snap: 0.5,
        extent: 3.5,
        controls: 'compact',
      },
      caption:
        'The unit circle (dashed) is mapped to an ellipse. Its long and short half-axes have lengths $\\sigma_1$ and $\\sigma_2$, the singular values.',
      tryThis: [
        {
          id: 't-circle',
          text: 'Make the circle map to a circle again (only rotation and equal stretching).',
          when: (s) => {
            const [a, b] = singularValues(s.matrix)
            return near(a, b, 0.02) && a > 0.1
          },
        },
        {
          id: 't-ratio',
          text: 'Make the ellipse exactly twice as long as it is wide.',
          when: (s) => {
            const [a, b] = singularValues(s.matrix)
            return b > 0.1 && near(a / b, 2, 0.03)
          },
        },
        {
          id: 't-flat',
          text: 'Squash the ellipse flat. What is $\\sigma_2$ now?',
          when: (s) => near(s.det, 0, 1e-9) && singularValues(s.matrix)[0] > 0.1,
        },
      ],
    },
    explain:
      'The singular value decomposition writes any matrix as $A = U\\Sigma V^T$: $V^T$ rotates (or reflects), $\\Sigma$ stretches along the axes by the **singular values** $\\sigma_1 \\ge \\sigma_2 \\ge 0$, and $U$ rotates again. So $A$ maps the unit circle to an ellipse with half-axes $\\sigma_1$ and $\\sigma_2$.\n\nUnlike eigenvectors, the SVD always exists, for every matrix, even non-square ones. Keeping only the biggest singular values gives the best low-rank approximation of $A$: the core of image compression, recommendation systems and PCA. Also $|\\det A| = \\sigma_1\\sigma_2$.',
    formula: {
      tex: 'A = U\\Sigma V^T, \\qquad \\Sigma = \\begin{pmatrix} \\sigma_1 & 0 \\\\ 0 & \\sigma_2 \\end{pmatrix}',
      caption: 'Rotate, stretch, rotate.',
    },
    misconception:
      'Singular values are not eigenvalues. A shear has both eigenvalues equal to 1, but it still stretches some directions: its singular values differ.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-diag',
        prompt:
          'What is the largest singular value of $\\begin{pmatrix} 3 & 0 \\\\ 0 & -5 \\end{pmatrix}$?',
        answer: 5,
        explain: 'Singular values are never negative: here they are 5 and 3.',
      },
      {
        kind: 'numeric',
        id: 'c-det',
        prompt: 'A 2×2 matrix has singular values 4 and 0.5. What is $|\\det A|$?',
        answer: 2,
        explain: '$|\\det A| = \\sigma_1\\sigma_2 = 2$.',
      },
      {
        kind: 'mcq',
        id: 'c-rank',
        prompt: 'If $\\sigma_2 = 0$, the matrix…',
        options: [
          { text: 'squashes the plane onto a line', correct: true },
          { text: 'is a rotation', why: 'A rotation has $\\sigma_1 = \\sigma_2 = 1$.' },
          { text: 'is the identity', why: 'The identity stretches nothing.' },
        ],
        explain: 'One direction is stretched by 0: the matrix has rank 1.',
      },
    ],
    realWorld: [
      {
        title: 'Image compression',
        body: 'Keep the top 20 singular values of a 1000 × 1000 photo and you store 4% of the numbers with most of the picture.',
      },
      {
        title: 'Recommendations',
        body: 'Netflix-style systems factor the huge “users × films” table with SVD-like methods to find hidden taste dimensions.',
      },
    ],
    takeaways: [
      'Every matrix is rotate–stretch–rotate: $A = U\\Sigma V^T$.',
      'The singular values are the half-axes of the image of the unit circle.',
      'Dropping small singular values gives the best simpler approximation.',
    ],
  },
}

export default content
