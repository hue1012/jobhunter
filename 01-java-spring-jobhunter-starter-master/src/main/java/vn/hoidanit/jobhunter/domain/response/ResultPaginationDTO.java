package vn.hoidanit.jobhunter.domain.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResultPaginationDTO {
    private Meta meta;
    private Object result;

    @Getter
    @Setter
    public static class Meta {
        private int page; // sotrang
        private int pageSize; // toidaphantu
        private int Pages; // tongsotrangdata
        private long total; // tongsophantu data
    }

}