import { Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { LOCATION_LIST, SKILLS_LIST } from "@/config/utils";
import { ICompanySelect } from "../user/modal.user";
import { useState, useEffect } from 'react';
import { callCreateJob, callFetchAllSkill, callFetchCompany, callFetchJobById, callUpdateJob, callFetchCompanyById } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import dayjs from 'dayjs';
import { IJob, ISkill } from "@/types/backend";
import { useAppSelector } from "@/redux/hooks";

interface ISkillSelect {
    label: string;
    value: string;
    key?: string;
}

const ViewUpsertJob = (props: any) => {
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);
    const [skills, setSkills] = useState<ISkillSelect[]>([]);
    const [companyName, setCompanyName] = useState<string>("");
    
    // Lấy thông tin user hiện tại
    const user = useAppSelector(state => state.account.user);
    const isAdmin = user?.role?.name === 'ADMIN';

    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id
    const [dataUpdate, setDataUpdate] = useState<IJob | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const init = async () => {
            const temp = await fetchSkillList();
            setSkills(temp);

            if (id) {
                const res = await callFetchJobById(id);
                if (res && res.data) {
                    setDataUpdate(res.data);
                    setValue(res.data.description);
                    
                    // Set company data cho admin
                    if (isAdmin) {
                        setCompanies([
                            {
                                label: res.data.company?.name as string,
                                value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                                key: res.data.company?.id
                            }
                        ])
                    }

                    //skills
                    const temp: any = res.data?.skills?.map((item: ISkill) => {
                        return {
                            label: item.name,
                            value: item.id,
                            key: item.id
                        }
                    })
                    
                    const formData: any = {
                        ...res.data,
                        skills: temp,
                        // Đảm bảo set đúng format ngày tháng
                        startDate: res.data.startDate ? dayjs(res.data.startDate) : null,
                        endDate: res.data.endDate ? dayjs(res.data.endDate) : null
                    };
                    
                    // Set company field based on user role
                    if (isAdmin) {
                        formData.company = {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?.id
                        };
                    } else {
                        // For non-admin users, set company name to text field
                        // Lấy tên công ty từ job data trước
                        if (res.data.company?.name) {
                            console.log("Setting company name from job data:", res.data.company.name);
                            formData.companyName = res.data.company.name;
                            setCompanyName(res.data.company.name);
                        } else if (user?.company?.id) {
                            // Nếu job không có company name, mới fetch từ API user company
                            try {
                                const companyRes = await callFetchCompanyById(user.company.id);
                                if (companyRes && companyRes.data && companyRes.data.name) {
                                    console.log("Setting company name from user company API:", companyRes.data.name);
                                    formData.companyName = companyRes.data.name;
                                    setCompanyName(companyRes.data.name);
                                }
                            } catch (error) {
                                console.error('Error fetching company data:', error);
                                const fallbackName = user?.company?.name || "Không có công ty";
                                formData.companyName = fallbackName;
                                setCompanyName(fallbackName);
                            }
                        } else {
                            const fallbackName = user?.company?.name || "Không có công ty";
                            formData.companyName = fallbackName;
                            setCompanyName(fallbackName);
                        }
                    }
                    
                    form.setFieldsValue(formData);
                }
            } else {
                // Khi tạo mới, set company cho user không phải admin
                if (!isAdmin) {
                    // Sử dụng setTimeout để đảm bảo form đã được render
                    setTimeout(() => {
                        form.setFieldsValue({
                            companyName: user?.company?.name || "Không có công ty"
                        });
                    }, 100);
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id, isAdmin, user?.company])

    // Riêng useEffect để set company name cho user không phải admin
    useEffect(() => {
        const fetchCompanyData = async () => {
            if (!isAdmin && user?.company?.id) {
                try {
                    // Gọi API để lấy thông tin công ty
                    const res = await callFetchCompanyById(user.company.id);
                    if (res && res.data && res.data.name) {
                        const companyName = res.data.name;
                        setCompanyName(companyName);
                        
                        // Set vào form nếu đang tạo mới (không có id)
                        if (!id) {
                            form.setFieldsValue({
                                companyName: companyName
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error fetching company data:', error);
                    // Fallback to user company name
                    const fallbackName = user?.company?.name || "Không có công ty";
                    setCompanyName(fallbackName);
                    if (!id) {
                        form.setFieldsValue({
                            companyName: fallbackName
                        });
                    }
                }
            }
        };

        fetchCompanyData();
    }, [isAdmin, user?.company?.id, id, form])

    // Usage of DebounceSelect
    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchCompany(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: `${item.id}@#$${item.logo}` as string
                }
            })
            return temp;
        } else return [];
    }

    async function fetchSkillList(): Promise<ISkillSelect[]> {
        const res = await callFetchAllSkill(`page=1&size=100`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: `${item.id}` as string
                }
            })
            return temp;
        } else return [];
    }

    const onFinish = async (values: any) => {
        // Validation: Non-admin users can only create jobs for their company
        if (!isAdmin && !user?.company) {
            notification.error({
                message: 'Lỗi',
                description: 'Bạn cần thuộc về một công ty để tạo việc làm.'
            });
            return;
        }

        if (dataUpdate?.id) {
            //update
            let arrSkills = [];
            if (typeof values?.skills?.[0] === 'object') {
                arrSkills = values?.skills?.map((item: any) => { return { id: item.value } });
            } else {
                arrSkills = values?.skills?.map((item: any) => { return { id: +item } });
            }

            const job: any = {
                name: values.name,
                skills: arrSkills,
                location: values.location,
                salary: values.salary,
                quantity: values.quantity,
                level: values.level,
                description: value,
                startDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.startDate) ? dayjs(values.startDate, 'DD/MM/YYYY').toDate() : values.startDate,
                endDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.endDate) ? dayjs(values.endDate, 'DD/MM/YYYY').toDate() : values.endDate,
                active: values.active,
            }

            // Set company based on user role
            if (isAdmin && values.company) {
                // Admin có thể chọn company - values.company từ DebounceSelect
                const cp = values?.company?.value?.split('@#$');
                job.company = {
                    id: cp && cp.length > 0 ? cp[0] : "",
                    name: values.company.label,
                    logo: cp && cp.length > 1 ? cp[1] : ""
                };
            } else if (!isAdmin && user?.company) {
                // HR/User khác thì lấy company từ user - bỏ qua values.company
                job.company = {
                    id: user.company.id,
                    name: user.company.name,
                    logo: (user.company as any).logo || ""
                };
            }

            const res = await callUpdateJob(job, dataUpdate.id);
            if (res.data) {
                message.success("Cập nhật việc làm thành công");
                navigate('/admin/job')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const arrSkills = values?.skills?.map((item: string) => { return { id: +item } });
            const job: any = {
                name: values.name,
                skills: arrSkills,
                location: values.location,
                salary: values.salary,
                quantity: values.quantity,
                level: values.level,
                description: value,
                startDate: dayjs(values.startDate, 'DD/MM/YYYY').toDate(),
                endDate: dayjs(values.endDate, 'DD/MM/YYYY').toDate(),
                active: values.active
            }

            // Set company based on user role
            if (isAdmin && values.company) {
                // Admin có thể chọn company - values.company từ DebounceSelect
                const cp = values?.company?.value?.split('@#$');
                job.company = {
                    id: cp && cp.length > 0 ? cp[0] : "",
                    name: values.company.label,
                    logo: cp && cp.length > 1 ? cp[1] : ""
                };
            } else if (!isAdmin && user?.company) {
                // HR/User khác thì lấy company từ user - bỏ qua values.company
                job.company = {
                    id: user.company.id,
                    name: user.company.name,
                    logo: (user.company as any).logo || ""
                };
            }

            const res = await callCreateJob(job);
            if (res.data) {
                message.success("Tạo mới việc làm thành công");
                navigate('/admin/job')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }



    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/admin/job">Quản lý việc làm</Link>,
                        },
                        {
                            title: dataUpdate?.id ? 'Cập nhật việc làm' : 'Tạo mới việc làm',
                        },
                    ]}
                />
            </div>
            <div >

                <ConfigProvider locale={enUS}>
                    <ProForm
                        form={form}
                        onFinish={onFinish}
                        submitter={
                            {
                                searchConfig: {
                                    resetText: "Hủy",
                                    submitText: <>{dataUpdate?.id ? "Cập nhật việc làm" : "Tạo mới việc làm"}</>
                                },
                                onReset: () => navigate('/admin/job'),
                                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                                submitButtonProps: {
                                    icon: <CheckSquareOutlined />
                                },
                            }
                        }
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProFormText
                                    label="Tên việc làm"
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng không bỏ trống' },
                                    ]}
                                    placeholder="Nhập tên việc làm"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="skills"
                                    label="Kỹ năng yêu cầu"
                                    options={skills}
                                    placeholder="Vui lòng chọn kỹ năng"
                                    rules={[{ required: true, message: 'Vui lòng chọn kỹ năng!' }]}
                                    allowClear
                                    mode="multiple"
                                    fieldProps={{
                                        suffixIcon: null
                                    }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="location"
                                    label="Địa điểm"
                                    options={LOCATION_LIST.filter(item => item.value !== 'ALL')}
                                    placeholder="Vui lòng chọn địa điểm"
                                    rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Mức lương"
                                    name="salary"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập mức lương"
                                    fieldProps={{
                                        addonAfter: " đ",
                                        formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                        parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Số lượng"
                                    name="quantity"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập số lượng"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="level"
                                    label="Trình độ"
                                    valueEnum={{
                                        INTERN: 'Không yêu cầu kinh nghiệm',
                                        FRESHER: 'Từ 1 - 2 năm kinh nghiệm',
                                        JUNIOR: 'Từ 2 - 3 năm kinh nghiệm',
                                        MIDDLE: 'Từ 3 - 5 năm kinh nghiệm',
                                        SENIOR: 'Từ 5 năm kinh nghiệm',
                                    }}
                                    placeholder="Vui lòng chọn trình độ"
                                    rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
                                />
                            </Col>

                            {/* Hiển thị trường company */}
                            <Col span={24} md={6}>
                                {isAdmin ? (
                                    <ProForm.Item
                                        name="company"
                                        label="Thuộc Công Ty"
                                        rules={[{ required: true, message: 'Vui lòng chọn công ty!' }]}
                                    >
                                        <DebounceSelect
                                            allowClear
                                            showSearch
                                            defaultValue={companies}
                                            value={companies}
                                            placeholder="Chọn công ty"
                                            fetchOptions={fetchCompanyList}
                                            onChange={(newValue: any) => {
                                                if (newValue?.length === 0 || newValue?.length === 1) {
                                                    setCompanies(newValue as ICompanySelect[]);
                                                }
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    </ProForm.Item>
                                ) : (
                                    <ProFormText
                                        name="companyName"
                                        label="Thuộc Công Ty"
                                        disabled
                                        placeholder="Không có công ty"
                                        initialValue={companyName || "Không có công ty"}
                                        fieldProps={{
                                            value: companyName || "Không có công ty"
                                        }}
                                    />
                                )}
                            </Col>

                        </Row>
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày bắt đầu"
                                    name="startDate"
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày kết thúc"
                                    name="endDate"
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    // width="auto"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSwitch
                                    label="Trạng thái"
                                    name="active"
                                    checkedChildren="Hoạt động"
                                    unCheckedChildren="Ngừng hoạt động"
                                    initialValue={true}
                                    fieldProps={{
                                        defaultChecked: true,
                                    }}
                                />
                            </Col>
                            <Col span={24}>
                                <ProForm.Item
                                    name="description"
                                    label="Mô tả việc làm"
                                    rules={[{ required: true, message: 'Vui lòng nhập mô tả việc làm!' }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
                                    />
                                </ProForm.Item>
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>

            </div>
        </div>
    )
}

export default ViewUpsertJob;