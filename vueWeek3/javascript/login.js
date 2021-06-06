import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

createApp({
    data() {
        return{
            apiUrl: 'https://vue3-course-api.hexschool.io',
            user:{
                username: '',
                password: '',
            },
        };
    },
    methods: {
        login() {
            const api = `${this.apiUrl}/admin/signin`;
            // console.log(api);
            axios.post(api, this.user)
                .then(res => {
                    // console.log(res);
                    if(!res.data.success){  //登入失敗
                        alert(res.data.message);
                    }else{   //登入成功
                        // const token = res.data.token;
                        // const expired = res.data.expired; 
                        const { token, expired } = res.data; //【解構手法】，知道res.data裡面有token及expired的值就可以這樣寫
                        //將 Token 寫入 cookie
                        document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`; //作用是將cookie存起來，hexToken為自定義名稱, new Date()方法將expired轉成日期格式

                        //登入成功，跳轉至後台產品頁面
                        window.location = './products.html';
                    }
                }).catch( err => {
                    console.log(err);
                });
        },
    },
}).mount('#app');