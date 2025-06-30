package vn.hoidanit.jobhunter.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.hoidanit.jobhunter.util.constant.GenderEnum;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ResUpdateUserDTO {
    private long id;
    private String name;
    private int age;
    private String address;
    private GenderEnum gender;
    private Instant updatedAt;
}
