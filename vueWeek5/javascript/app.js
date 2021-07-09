import productDetailModal from "./productDetailModal.js";
import pagination from './pagination.js';

const app = Vue.createApp({
    data(){
        return{
            loadingStatus: {
                loadingItem: '',
            },
            deleteCartAllLoading: false,
            products:[], //陣列-所有商品資料
            product:{},  //物件-單筆商品
            pagination:{},  //分頁
            cartData:{},  //購物車資料
            carts:[],  //已加入購物車資料
            form:{ //訂單資訊
                user:{
                    name: "",
                    email: "",
                    tel: "",
                    address: "",
                },
                message: "",
            }
        }
    },
    components:{
        pagination,
    },
    mounted(){ //進入畫面的同時
        this.getProducts();
        this.getCart();
    },
    methods:{
        //GET 商品資料
        getProducts(page =1){
            const api = `${apiUrl}/api/${apiPath}/products?page=${page}`;
            axios.get(api)
                .then((res) => {
                    // console.log(res);
                    if(res.data.success){
                        this.products = res.data.products;
                        this.pagination = res.data.pagination;
                    }else{
                        alert(res.data.message);
                    }
                }).catch((error) =>{
                    console.log(error);
                });
        },
        showProductInfo(item){ //取得單一產品細節
            // console.log(item);
            this.loadingStatus.loadingItem = item.id; //設定讀取圖示, 賦予點選的item ID
            const api = `${apiUrl}/api/${apiPath}/product/${item.id}`; //取得單一產品細節api
            axios.get(api)
                .then((res) => {
                    // console.log(res);
                    if(res.data.success){
                        this.product = res.data.product;
                        this.$refs.productDetailModal.openModal();
                        this.loadingStatus.loadingItem = ''; //設定讀取圖示, 清空item ID
                    }else{
                        alert(res.data.message);
                    }
                }).catch( (error) =>{
                    console.log(error);
                });
        },
        addCart(id, qty=1){ //加入購物車。qty若沒傳入值會是undefined, 故可用 qty = 1, 當qty沒傳入值時預設給1
            console.log('型別',typeof(id));
            console.log('呼叫emit');
            //讀取效果
            this.loadingStatus.loadingItem = id; //設定讀取圖示, 賦予點選的item ID
            //訂出購物車的結構
            const cart = {
                product_id: id,
                qty,
            }
            // console.log(cart);
            const api = `${apiUrl}/api/${apiPath}/cart`;
            axios.post(api, { "data": cart})
            .then((res) =>{
                // console.log(res);
                if(res.data.success){
                    this.loadingStatus.loadingItem = ''; //設定讀取圖示, 清空item ID
                    this.getCart();
                }else{
                    alert(res.data.message);
                }
            }).catch((error) =>{
                console.log(error);
            });
        },
        getCart(){ //取得購物車資訊
            const api = `${apiUrl}/api/${apiPath}/cart`;
            axios.get(api)
            .then((res) =>{
                // console.log(res);
                if(res.data.success){
                    this.cartData = res.data.data;
                    this.carts = res.data.data.carts;
                }else{
                    alert(res.data.message);
                }
            }).catch((error) =>{
                console.log(error);
            });
        },
        updateCart(data){
            this.loadingStatus.loadingItem = data.id;
            const api =`${apiUrl}/api/${apiPath}/cart/${data.id}`;
            const cart = {
                product_id: data.product_id,
                qty: data.qty,
            };
            axios.put(api, { data: cart })
            .then((res) =>{
                if(res.data.success){
                    this.loadingStatus.loadingItem = ''; //設定讀取圖示, 清空item ID
                    this.getCart();
                }else{
                    alert(res.data.success);
                    this.loadingStatus.loadingItem = ''; //設定讀取圖示, 清空item ID
                }
            }).catch((error)=>{
                console.log(error);
            })
        },
        deleteCartItem(itemID){
            //讀取效果
            this.loadingStatus.loadingItem = itemID; //設定讀取圖示, 賦予點選的item ID

            const api = `${apiUrl}/api/${apiPath}/cart/${itemID}`;
            axios.delete(api)
            .then((res) =>{
                // console.log(res);
                if(res.data.success){
                    this.loadingStatus.loadingItem = '';
                    this.getCart();
                }else{
                    alert(res.data.message);
                }
            }).catch((error) =>{
                console.log(error);
            });
        },
        deleteCartAll(){ //刪除所有購物車資料
            //讀取圖示
            this.deleteCartAllLoading = true;
            const api = `${apiUrl}/api/${apiPath}/carts`;
            axios.delete(api)
            .then((res) =>{
                if(res.data.success){
                    this.deleteCartAllLoading = false;
                    this.getCart();
                }else{
                    alert(res.data.message);
                }
            }).catch((error) =>{
                console.log(error);
            });
        },
        createOrder(){
            const api = `${apiUrl}/api/${apiPath}/order`;
            const order = this.form;
            axios.post(api, {data: order})
            .then((res) =>{
                if(res.data.success){
                    this.$refs.form.resetForm();  //resetForm() 是 vForm元件底下的方法, 但無法清除欄位:留言(使用textarea的資料)
                    this.form.message = '';  //清空 欄位:留言 的資料
                    this.getCart();
                }else{
                    alert(res.data.message);
                }
            }).catch((error) =>{
                console.log(error);
            })
        },
    },
});

// 【表單驗證】VeeValidate 規則全部加入(CDN版本)
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});

//...Start...【表單驗證】VeeValidate 加入多國語系，將外部資源儲存至本地
// VeeValidateI18n.loadLocaleFromURL('./zh_TW.json'); //載不到??
VeeValidateI18n.loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});
//...End...

// 註冊全域元件 , 放置在 createApp 後方，app.mount之前

// 表單驗證元件
app.component('VForm', VeeValidate.Form);   //表單的Form元件(Form標籤)
app.component('VField', VeeValidate.Field);  //對應到input、select
app.component('ErrorMessage', VeeValidate.ErrorMessage);  //錯誤訊息

// Modal_單一商品資訊
app.component('productDetailModal',productDetailModal);

app.mount('#app');