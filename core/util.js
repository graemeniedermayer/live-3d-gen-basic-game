let remove_children = (item) => {
    if(!item){return}
    // one is for the hand
    for( var i = item.children.length - 1; i >= 0; i--) { 
        let obj = item.children[i];
        item.remove(obj); 
    }
}
export {remove_children}