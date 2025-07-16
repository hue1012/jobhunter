import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IResume } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Space, message, notification, Button } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteResume } from "@/config/api";
import queryString from 'query-string';
import { fetchResume } from "@/redux/slice/resumeSlide";
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import { EditOutlined, DownloadOutlined } from "@ant-design/icons";

const ResumePage = () => {
    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.resume.isFetching);
    const meta = useAppSelector(state => state.resume.meta);
    const resumes = useAppSelector(state => state.resume.result);
    const dispatch = useAppDispatch();

    const [dataInit, setDataInit] = useState<IResume | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const handleDeleteResume = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteResume(id);
            if (res && res.data) {
                message.success('Xóa hồ sơ ứng tuyển thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleDownloadCV = async (resume: IResume) => {
        if (resume.url) {
            try {
                // Use the correct path based on backend configuration
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${resume.url}`);
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    // Get job name from jobId if it's an object
                    const jobName = typeof resume.jobId === 'object' && resume.jobId ? resume.jobId.name : 'job';
                    a.download = `CV_${resume.email}_${jobName}.${resume.url.split('.').pop()}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    message.success('Tải CV thành công');
                } else {
                    throw new Error('Không thể tải file');
                }
            } catch (error) {
                notification.error({
                    message: 'Lỗi tải CV',
                    description: `Không thể tải file CV: ${resume.url}. Vui lòng kiểm tra file có tồn tại không.`
                });
            }
        } else {
            notification.error({
                message: 'Lỗi',
                description: 'Không tìm thấy file CV'
            });
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IResume>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record.id}
                    </a>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            sorter: true,
            render: (text, record) => {
                const statusMap: { [key: string]: string } = {
                    'PENDING': 'Chờ xác nhận',
                    'REVIEWING': 'Đang xem xét',
                    'APPROVED': 'Chấp nhận',
                    'REJECTED': 'Không phù hợp',
                };
                return statusMap[record.status] || record.status;
            },
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: 'Chờ xác nhận',
                        REVIEWING: 'Đang xem xét',
                        APPROVED: 'Chấp nhận',
                        REJECTED: 'Không phù hợp',
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },

        {
            title: 'Công việc',
            dataIndex: 'jobId',
            hideInSearch: true,
            render: (text, record) => {
                if (typeof record.jobId === 'object' && record.jobId) {
                    return record.jobId.name;
                }
                return record.jobId || 'N/A';
            }
        },
        {
            title: 'Công ty',
            dataIndex: 'companyId',
            hideInSearch: true,
            render: (text, record) => {
                if (typeof record.companyId === 'object' && record.companyId) {
                    return record.companyId.name;
                }
                return record.companyId || 'N/A';
            }
        },
        {
            title: 'CV File',
            dataIndex: 'url',
            hideInSearch: true,
            width: 150,
            render: (text, record) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            wordBreak: 'break-all'
                        }}>
                            {record.url}
                        </span>
                        {record.url && (
                            <Button
                                type="link"
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownloadCV(record)}
                                style={{ 
                                    padding: 0, 
                                    height: 'auto',
                                    color: '#1890ff'
                                }}
                            >
                                Tải CV
                            </Button>
                        )}
                    </div>
                );
            }
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Hành động',
            hideInSearch: true,
            width: 120,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataInit(entity);
                        }}
                    />
                    
                    {entity.url && (
                        <DownloadOutlined
                            style={{
                                fontSize: 20,
                                color: '#52c41a',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleDownloadCV(entity)}
                            title="Tải CV"
                        />
                    )}

                    {/* <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa resume"}
                        description={"Bạn có chắc chắn muốn xóa resume này ?"}
                        onConfirm={() => handleDeleteResume(entity.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm> */}
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };

        if (clone?.status?.length) {
            clone.filter = sfIn("status", clone.status).toString();
            delete clone.status;
        }

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.status) {
            sortBy = sort.status === 'ascend' ? "sort=status,asc" : "sort=status,desc";
        }

        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        //mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        // Populate companyId and jobId to get related data
        temp += "&populate=companyId,jobId&fields=companyId.id,companyId.name,companyId.logo,jobId.id,jobId.name";
        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}
            >
                <DataTable<IResume>
                    actionRef={tableRef}
                    headerTitle="Danh sách Hồ sơ ứng tuyển"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={resumes}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchResume({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <></>
                        );
                    }}
                />
            </Access>
            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />
        </div >
    )
}

export default ResumePage;