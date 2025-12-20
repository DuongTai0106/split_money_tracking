import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

const SettleDebtModal = ({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  groupCurrency,
}) => {
  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận thanh toán">
      <div className="text-center space-y-6">
        <p className="text-gray-600">
          Bạn xác nhận rằng{" "}
          <span className="font-bold text-gray-900">
            {transaction.fromName}
          </span>{" "}
          đã trả tiền mặt hoặc chuyển khoản cho{" "}
          <span className="font-bold text-gray-900">{transaction.toName}</span>?
        </p>

        <div className="py-4 bg-indigo-50 rounded-xl">
          <p className="text-3xl font-bold text-indigo-700">
            {transaction.amount.toLocaleString()} {groupCurrency}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="w-full">
            Hủy bỏ
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Xác nhận đã trả
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettleDebtModal;
