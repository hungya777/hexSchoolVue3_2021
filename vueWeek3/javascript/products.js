import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

let productModal = null;
let delProductModal = null;

createApp({
    data(){
        return{
            apiUrl: 'https://vue3-course-api.hexschool.io',
            apiPath: 'hungya777',
            products: [],
            isNew: false,
            tempProduct:{   //用於open Modal使用
                imagesUrl:[],
            }
        }
    },
    mounted(){
        productModal = new bootstrap.Modal(document.getElementById('productModal'),{
            keyboard: false
        });

        delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'),{
            keyboard: false
        });

        // Cookie 取出來
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        if(!token){
            alert('您尚未登入，請重新登入。');
            window.location = './index.html';
        }
        axios.defaults.headers.common.Authorization = token;  //將token加到headers的'Authorization'屬性之中當作預設值, 之後只要戳任何API都會自動帶入token (如get、put、delete...等)

        this.getData();
    },
    methods:{
        //GET 後台取得產品資訊   
        getData(){
            const api = `${this.apiUrl}/api/${this.apiPath}/admin/products`;
            console.log(api);
            axios.get(api)
                .then( res => {
                    console.log(res);
                    if(res.data.success){
                        this.products = res.data.products;
                        // console.log(this.products);;               
                    }else{
                        alert('您尚未登入請重新登入。');
                        window.location = './index.html';
                    }
                })
                .catch( err => {
                    console.log(err);
                })
        },
        openModal(isNew, item){
            console.log(isNew, item);
            switch (isNew){
                //新增
                case 'new':
                    this.tempProduct = {
                        imagesUrl:[],
                    }
                    this.isNew = true;
                    productModal.show();  //打開Modal元件
                    break;
                //編輯
                case 'edit':
                    this.tempProduct = {...item}; //淺層拷貝, 避免在編輯送出前就將資料庫資料同步修改
                    this.isNew = false;
                    productModal.show();
                    break;
                //刪除
                case 'delete':
                    this.tempProduct = {...item};
                    delProductModal.show();
                default:
                    break;
            }
        },
        updateProduct(){
            //新增
            let api = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
            let httpMethod = 'post';
            //根據isNew 來判斷要串接 post 或是 put API
            if(!this.isNew){
                //編輯狀態
                api = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
                httpMethod = 'put';
            }

            axios[httpMethod](api,{data: this.tempProduct })
                .then(res => {
                    if(res.data.success){
                        alert(res.data.message);
                        productModal.hide();  //關閉Modal
                        this.getData();  //重新取得產品列表
                    }else{
                        alert(res.data.message);
                    }
                })
                .catch( err => {
                    console.log(err);
                })
        },
        deleteProduct(){
            const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
            
            axios.delete(url)
                .then( res => {
                    if(res.data.success){
                        alert(res.data.message);
                        delProductModal.hide();  //關閉Modal
                        this.getData();
                    }else{
                        alert(res.data.message);
                    }
                } )
                .catch( res => {
                    console.log(res);
                })
        },
        createImages(){
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
        },
    },
}).mount('#app');


/*
//API info
const url = 'https://vue3-course-api.hexschool.io'; // 請加入站點
const path = 'hungya777'; // 請加入個人 API Path

//DOM
const productCount = document.querySelector("#productCount"); //統計產品項目數量

//調出資料
const app = {
    data:{
        products:[],
    },
    getData(){
        axios.get(`${url}/api/${path}/admin/products`)
            .then(res =>{
                console.log(res);
                if(res.data.success){
                    this.data.products = res.data.products;
                    console.log(this.data.products);
                    this.render();
                }
            })
    },
    render(){  //重新渲染
        const productListDom = document.querySelector('#productList');
        //forEach寫法：
        // let template = '';
        // this.data.products.forEach((item) =>{
        //     template = template +`
        //         <tr>
        //             <td>${item.title}</td>
        //             <td></td>
        //             <td></td>
        //             <td></td>
        //             <td><button type="button" data-id="${item.id}" class="deleteBtn">刪除</button></td>
        //         <tr>
        //     `;
        // });
        
        
        //map寫法: (縮寫)
        const template = this.data.products.map( item => `
            <tr>
                <td>${item.title}</td>
                <td width="120">${item.origin_price}</td>
                <td width="120">${item.price}</td>
                <td width="150">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="${item.id}" ${item.is_enabled? 'checked':''} data-action="status" data-id="${item.id}">
                        <label class="form-check-label" for="isEnabled">${item.is_enabled? '啟用' : '未啟用'}</label>
                    </div>
                </td>
                <td>
                    <button type="button" data-id="${item.id}" class="btn btn-sm btn-danger deleteBtn">刪除</button>
                </td>
            <tr>
        `).join('');  //join空字串，讓陣列轉成字串格式並可去掉陣列中的逗號

        // console.log(template);
        productListDom.innerHTML = template;

        //動元素需在.innerHTML渲染之後操作
        //是否啟用
        const showStatus = document.querySelectorAll(".form-check-input");
        showStatus.forEach(status =>{
            status.addEventListener('click',this.showStatus);
        });
        //delete
        const deleteBtns = document.querySelectorAll(".deleteBtn");
        deleteBtns.forEach(btn =>{
            btn.addEventListener('click', this.deleteproduct);
        });

        //統計產品數量
        // console.log(this.data.products.length);
        productCount.textContent = this.data.products.length;
    },
    showStatus(evt){
        const action = evt.target.dataset.action; //取得 data-action的值
        const productId = evt.target.dataset.id; //取得 data-id的值, 這裡是取${item.id}
        app.data.products.forEach(item =>{
            if(productId == item.id){
                item.is_enabled = !item.is_enabled;
                app.render(); //重新渲染
            }
        })
    },
    deleteproduct(evt){
        //事件物件
        const productId = evt.target.dataset.id;
        console.log(evt, productId);
        axios.delete(`${url}/api/${path}/admin/product/${productId}`)
        .then(res =>{
            console.log(res);
            // this.getData(); // 操作動元素(如deleteBtn)時，this的指向會改變，故無法正常的渲染畫面  
            app.getData();  //需要物件app下調用
        })
    },
    init(){
        // Cookie 取出來
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        axios.defaults.headers.common['Authorization']= token  //將token加到headers的'Authorization'屬性之中
        console.log(token);
        this.getData();

        //確認是否登入 (驗證使用)
        // axios.post(`${url}/api/user/check`)
        //     .then((res)=>{
        //         console.log(res);
        //     })
    }
}

app.init();
*/