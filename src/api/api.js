const BASE_URL = "http://localhost:5000";

const endpoints = {
    // Auth
    login: `${BASE_URL}/auth/login`,
    register: `${BASE_URL}/auth/register`,

    // Category
    category: `${BASE_URL}/category`,
    getQuizByCategory: `${BASE_URL}/category/quiz`,

    // Quiz
    quizzes: `${BASE_URL}/quiz`,
    quiz: (id) => `${BASE_URL}/quiz/${id}`,

    // Question
    question_buttons: `${BASE_URL}/question/buttons`,
    question_checkboxes: `${BASE_URL}/question/checkboxes`,
    question_reorders: `${BASE_URL}/question/reorder`,
    question_ranges: `${BASE_URL}/question/range`,
    question_locations: `${BASE_URL}/question/location`,
    question_typeanswers: `${BASE_URL}/question/typeanswer`,

    question_button: (id) => `${BASE_URL}/question/buttons/${id}`,
    question_checkbox: (id) => `${BASE_URL}/question/checkboxes/${id}`,
    question_reorder: (id) => `${BASE_URL}/question/reorder/${id}`,
    question_range: (id) => `${BASE_URL}/question/range/${id}`,
    question_location: (id) => `${BASE_URL}/question/location/${id}`,
    question_typeanswer: (id) => `${BASE_URL}/question/typeanswer/${id}`
}

export default endpoints;

