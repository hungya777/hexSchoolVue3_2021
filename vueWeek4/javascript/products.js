import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
import pagination from './pagination.js';

let productModal = null;
let delProductModal = null;

const app = createApp({
    data(){
        return{
            apiUrl: 'https://vue3-course-api.hexschool.io',
            apiPath: 'hungya777',
            products: [],
            isNew: false,
            tempProduct:{   //用於open Modal使用
                imagesUrl:[],
            },
            pagination:{},
        }
    },
    components:{
        pagination
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
        getData(page = 1){
            const api = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;
            console.log(api);
            axios.get(api)
                .then( res => {
                    console.log(res);
                    if(res.data.success){
                        this.products = res.data.products;
                        this.pagination = res.data.pagination;
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
        updateProduct(tempProduct){
            //新增
            let api = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
            let httpMethod = 'post';
            //根據isNew 來判斷要串接 post 或是 put API
            if(!this.isNew){
                //編輯狀態
                api = `${this.apiUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`;
                httpMethod = 'put';
            }

            axios[httpMethod](api,{data: tempProduct })
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
        deleteProduct(tempProduct){
            const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`;
            
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
    },
});

// 註冊全域元件 , 放置在 createApp 後方，app.mount之前
// Modal
app.component('productModal',{
    // emits: ["update-product","delete-product"],
    props:['tempProduct','isNew'],
    template:`<div id="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content border-0">
                <div class="modal-header bg-dark text-white">
                    <h5 id="productModalLabel" class="modal-title">                       
                        <span v-if="isNew">新增產品</span>
                        <span v-else>編輯產品</span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-4">
                        <div class="form-group">
                            <label for="imageUrl">主要圖片</label>
                            <input v-model="tempProduct.imageUrl" type="text" class="form-control" placeholder="請輸入圖片連結"> 
                            <img class="img-fluid" :src="tempProduct.imageUrl"> <!-- img-fluid : 設定為響應式圖片，運用 max-width: 100%; 和 height: auto;，讓圖片可依父元素進行縮放。 -->
                        </div>
                        <div class="mb-1">多圖新增</div>
                        <!-- tempProduct.imagesUrl有陣列 => 執行    Array.isArray([])=true -->
                        <div v-if="Array.isArray(tempProduct.imagesUrl)">
                            <div class="mb-1" v-for="(image, key) in tempProduct.imagesUrl" :key="key">
                                <div class="form-group">
                                <label for="imageUrl">圖片網址</label>
                                <input v-model="tempProduct.imagesUrl[key]" type="text" class="form-control"
                                    placeholder="請輸入圖片連結">
                                </div>
                                <img class="img-fluid" :src="image">
                            </div>

                            <!--陣列長度為0 || 陣列中沒有空值 =>執行-->
                            <div
                                v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                                <button class="btn btn-outline-primary btn-sm d-block w-100"
                                @click="tempProduct.imagesUrl.push('')">
                                新增圖片
                                </button>
                            </div>

                            <!--陣列長度不為0 || 陣列中有空值 =>執行-->
                            <div v-else>
                                <button class="btn btn-outline-danger btn-sm d-block w-100" @click="tempProduct.imagesUrl.pop()">
                                刪除圖片
                                </button>
                            </div>
                        </div>
                        
                        <!--沒有tempProduct.imagesUrl=>執行      Array.isArray()=false      -->
                        <div v-else>
                        <button class="btn btn-outline-primary btn-sm d-block w-100"
                            @click="createImages">
                            新增圖片
                        </button>
                        </div>

                    </div>
                    <div class="col-sm-8">
                        <div class="form-group">
                            <label for="title">標題</label>
                            <input id="title" v-model="tempProduct.title" type="text" class="form-control" placeholder="請輸入標題">
                        </div>
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="category">分類</label>
                                <input id="category" v-model="tempProduct.category" type="text" class="form-control" placeholder="請輸入分類">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="unit">單位</label>
                                <input id="unit" v-model="tempProduct.unit" type="text" class="form-control" placeholder="請輸入單位">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="origin_price">原價</label>
                                <input id="origin_price"
                                v-model.number="tempProduct.origin_price" type="text" class="form-control" placeholder="請輸入原價">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="price">售價</label>
                                <input id="price" v-model.number="tempProduct.price" type="text" class="form-control" placeholder="請輸入售價">
                            </div>
                        </div>
                        <hr>
                        <div class="form-group">
                            <label for="description" class="form-label">產品描述</label>
                            <textarea class="form-control" id="description" v-model="tempProduct.description" type="text" placeholder="請輸入產品描述">
                            </textarea>
                        </div>
                        <div class="form-group">
                            <label for="content" class="form-label">說明內容</label>
                            <textarea class="form-control" id="content" v-model="tempProduct.content" type="text" placeholder="請輸入說明內容">
                            </textarea>
                        </div>
                        <div class="form-group">
                            <div class="form-check">
                                <input id="is_enabled" v-model="tempProduct.is_enabled" class="form-check-input" type="checkbox" :true-value="1" :false-value="0">
                                <label class="form-check-label" for="is_enabled">
                                是否啟用
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>   
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                取消
                </button>
                <button type="button" class="btn btn-primary" @click="$emit('update-product', tempProduct)">
                確認
                </button>
            </div>
            </div>
        </div>
    </div>


    <div id="delProductModal" class="modal fade" tabindex="-1" aria-labelledby="delProductModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="delProductModalLabel">刪除產品</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    是否刪除
                    <strong class="text-danger">{{tempProduct.title}}</strong>
                    <br>
                    產品(刪除後將無法恢復)。
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        取消
                    </button>
                    <button type="button" class="btn btn-danger" @click="$emit('delete-product',tempProduct)">
                        確認刪除
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    methods:{
        createImages(){
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
        },
    },
});

// app.component('pagination',{
//     props:['page'],
//     template: `<nav aria-label="Page navigation example">
//         <ul class="pagination">
//         <!--往前一頁; :class="{'disabled': !page.has_pre}" 當頁碼沒有前一頁時鎖住往前一頁功能-->
//         <li class="page-item" :class="{'disabled': !page.has_pre }">
//             <a class="page-link" href="#" aria-label="Previous"
//             @click="$emit('get-data', page.current_page -1)">
//                 <span aria-hidden="true">&laquo;</span>
//             </a>
//         </li>
//         <!--中間頁碼; :class="{ 'active': item === page.current_page}判斷目前頁面跟當前頁面是否一致,若一致就套用active的視覺效果--> 
//         <li class="page-item" 
//             :class = "{'active': item === page.current_page}"
//             v-for="item in page.total_pages" :key="item">
//             <a class="page-link" href="#" @click="$emit('get-data', item)">{{ item }}</a>
//         </li>
//         <!--往後一頁; :class="{'disabled': !page.has_pre}" 當頁碼沒有後一頁時鎖住往後一頁功能-->
//         <li class="page-item" :class="{'disabled': !page.has_next}">
//             <a class="page-link" href="#" aria-label="Next"
//             @click="$emit('get-data', page.current_page +1)">
//                 <span aria-hidden="true">&raquo;</span>
//             </a>
//         </li>
//         </ul>
//     </nav>`,
//     created(){
//         console.log(this.page);
//     }
// });

app.mount('#app');
