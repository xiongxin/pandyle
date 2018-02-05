interface book{
    id:number,
    title:string,
    author:{
        name: string,
        nation: string
    }
    price:number,
}

let vm:myVM;
$(document).ready(function () {
    vm = new myVM($('.temp'), {
        id: 2,
        title: '百年孤独',
        author: {
            name: '马尔克斯',
            nation: '哥伦比亚'
        },
        price: 89
    })
})

function setName(){
    let author = vm.author;
    author.name = 'rrr';
    console.log(vm.author);
}

class myVM extends Pandyle.VM<book>{
    get title(){
        return this.get('title');
    }

    set title(value:string){
        this.set({
            'title': value
        })
    }

    get author(){
        return this.get('author');
    }
    set author(value:{name:string, nation:string}){
        this.set({
            'author': value
        })
    }


}