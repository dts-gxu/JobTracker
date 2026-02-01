// 主要JavaScript功能

// 文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initTooltips();
    initSearchFilters();
    initFormValidation();
    addFadeInAnimation();
});

// 初始化工具提示
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// 初始化搜索和筛选功能
function initSearchFilters() {
    const searchForm = document.querySelector('form[method="GET"]');
    if (searchForm) {
        // 实时搜索功能
        const searchInput = searchForm.querySelector('input[name="search"]');
        const statusSelect = searchForm.querySelector('select[name="status"]');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (this.value.length >= 2 || this.value.length === 0) {
                        // 可以添加AJAX实时搜索功能
                        console.log('搜索:', this.value);
                    }
                }, 500);
            });
        }
        
        if (statusSelect) {
            statusSelect.addEventListener('change', function() {
                // 状态筛选变更时可以自动提交表单
                // searchForm.submit();
            });
        }
    }
}

// 初始化表单验证
function initFormValidation() {
    const forms = document.querySelectorAll('form[method="POST"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(this)) {
                event.preventDefault();
                event.stopPropagation();
            }
            this.classList.add('was-validated');
        });
        
        // 实时验证
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

// 验证表单
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// 验证单个字段
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // 必填验证
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = '此字段为必填项';
    }
    
    // 日期验证
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        if (selectedDate > today) {
            isValid = false;
            errorMessage = '投递日期不能是未来日期';
        } else if (selectedDate < oneYearAgo) {
            isValid = false;
            errorMessage = '投递日期不能超过一年前';
        }
    }
    
    // 文本长度验证
    if (field.type === 'text' && value.length > 100) {
        isValid = false;
        errorMessage = '字符长度不能超过100';
    }
    
    // 显示验证结果
    showFieldValidation(field, isValid, errorMessage);
    
    return isValid;
}

// 显示字段验证结果
function showFieldValidation(field, isValid, errorMessage) {
    // 移除之前的验证状态
    field.classList.remove('is-valid', 'is-invalid');
    
    // 移除之前的错误信息
    const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    if (!isValid) {
        field.classList.add('is-invalid');
        
        // 添加错误信息
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = errorMessage;
        field.parentNode.appendChild(feedback);
    } else if (field.value.trim()) {
        field.classList.add('is-valid');
    }
}

// 添加淡入动画
function addFadeInAnimation() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

// 确认删除功能
function confirmDelete(message = '确定要删除这条记录吗？') {
    return confirm(message);
}

// 显示加载状态
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="loading"></span> 处理中...';
    element.disabled = true;
    
    return function hideLoading() {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// 显示通知消息
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // 自动关闭
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 计算投递天数
function getDaysFromApply(applyDateString) {
    const applyDate = new Date(applyDateString);
    const today = new Date();
    const diffTime = today - applyDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// 获取状态颜色类
function getStatusColorClass(status) {
    const colorMap = {
        '准备中': 'secondary',
        '已投递': 'info',
        '笔试': 'warning',
        '一面': 'warning',
        '二面': 'warning',
        '三面': 'warning',
        'HR面': 'warning',
        'Offer': 'success',
        '已拒绝': 'danger'
    };
    
    return colorMap[status] || 'primary';
}

// 导出数据（未来功能）
function exportData() {
    // 将来可以实现导出到Excel功能
    console.log('导出功能待实现');
}

// 导入数据（未来功能）
function importData() {
    // 将来可以实现从Excel导入功能
    console.log('导入功能待实现');
}

// AJAX请求封装
async function makeRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('请求失败:', error);
        showNotification('操作失败，请稍后重试', 'danger');
        throw error;
    }
}

// 获取统计数据
async function fetchStats() {
    try {
        const stats = await makeRequest('/api/stats');
        return stats;
    } catch (error) {
        console.error('获取统计数据失败:', error);
        return null;
    }
}

// 键盘快捷键
document.addEventListener('keydown', function(event) {
    // Ctrl + N: 添加新投递
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        const addLink = document.querySelector('a[href*="add"]');
        if (addLink) {
            window.location.href = addLink.href;
        }
    }
    
    // Ctrl + H: 返回首页
    if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        window.location.href = '/';
    }
    
    // ESC: 关闭模态框
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
});

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时，可以刷新数据
        console.log('页面重新可见');
    }
});

// 添加全局错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    // 可以发送错误报告到服务器
});

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 