export default{
    props:['page'],
    template: `<nav aria-label="Page navigation example">
        <ul class="pagination">
        <!--往前一頁; :class="{'disabled': !page.has_pre}" 當頁碼沒有前一頁時鎖住往前一頁功能-->
        <li class="page-item" :class="{'disabled': !page.has_pre }">
            <a class="page-link" href="#" aria-label="Previous"
            @click="$emit('get-data', page.current_page -1)">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
        <!--中間頁碼; :class="{ 'active': item === page.current_page}判斷目前頁面跟當前頁面是否一致,若一致就套用active的視覺效果--> 
        <li class="page-item" 
            :class = "{'active': item === page.current_page}"
            v-for="item in page.total_pages" :key="item">
            <a class="page-link" href="#" @click="$emit('get-data', item)">{{ item }}</a>
        </li>
        <!--往後一頁; :class="{'disabled': !page.has_pre}" 當頁碼沒有後一頁時鎖住往後一頁功能-->
        <li class="page-item" :class="{'disabled': !page.has_next}">
            <a class="page-link" href="#" aria-label="Next"
            @click="$emit('get-data', page.current_page +1)">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
        </ul>
    </nav>`,
    created(){
        console.log(this.page);
    }    
}