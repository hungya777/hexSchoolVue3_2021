//API info
const url = 'https://vue3-course-api.hexschool.io'; // 請加入站點
const path = 'hungya777'; // 請加入個人 API Path

//取得動元素 (之後vue框架較不使用)
const usernameInput = document.querySelector('#username');
const passwordInput =  document.querySelector('#password');
const loginBtn = document.querySelector('#login');

loginBtn.addEventListener('click',login); //點擊觸發 login函式

//取得Token, 並將Token存到cookie
function login(event){
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    const data = {
        username,
        password,
    }
    // console.log(username, password);
    // console.log(data);
    axios.post(`${url}/admin/signin`,data) //發出請求
    .then((res) => {
        console.log(res);
        if(res.data.success){  //success部分也可用cache去接收判斷
            // const token = res.data.token;
            // const expired = res.data.expired;           
            const {token, expired} = res.data; //【解構手法】，知道res.data裡面有token及expired的值就可以這樣寫
            console.log(token, expired);
            document.cookie = `hexToken=${token};expires=${new Date(expired)}`;  //作用是將cookie存起來，hexToken為自定義名稱, new Date()方法將expired轉成日期格式
            window.location = './products.html'; //轉換頁面
        }else{
            alert(res.data.message);  //登入訊息
        }
    } )
    .catch((error) => { //如API路徑錯誤，可以印出錯誤
        console.log(error);
    });
}