

export const firstToUpper = function(str){
    if (!str){
        return
    }
    if (str.trim().length === 0){
        return str
    }
    return str.trim().replace(str[0],str[0].toUpperCase());
}