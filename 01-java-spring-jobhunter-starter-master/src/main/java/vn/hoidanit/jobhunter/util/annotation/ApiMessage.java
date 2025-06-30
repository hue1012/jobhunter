package vn.hoidanit.jobhunter.util.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME) // hoat dong cua annotation
@Target(ElementType.METHOD) // pham vi hoat dong cua annotation
public @interface ApiMessage {
    String value(); // truyen gia tri cho annotation
}
