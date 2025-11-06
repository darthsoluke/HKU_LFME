set -e

# 训练用的脚本
# chmod +x train.sh
# ./train.sh
# ！！根据自己的服务器灵活配置跑在哪张卡上

# 默认数据集存放位置
DATA=./domainbed/data/pacs_data
ALGO=ERM
DATASET=PACS

# 为了避免输出目录冲突，分别指定不同的 output_dir
CUDA_VISIBLE_DEVICES=2 python -m domainbed.scripts.train \
  --data_dir="$DATA" --algorithm "$ALGO" --dataset "$DATASET" \
  --test_env 0 --output_dir outputs/ERM/ERM_te0 &
CUDA_VISIBLE_DEVICES=3 python -m domainbed.scripts.train \
  --data_dir="$DATA" --algorithm "$ALGO" --dataset "$DATASET" \
  --test_env 1 --output_dir outputs/ERM/ERM_te1 &
CUDA_VISIBLE_DEVICES=4 python -m domainbed.scripts.train \
  --data_dir="$DATA" --algorithm "$ALGO" --dataset "$DATASET" \
  --test_env 2 --output_dir outputs/ERM/ERM_te2 &
CUDA_VISIBLE_DEVICES=5 python -m domainbed.scripts.train \
  --data_dir="$DATA" --algorithm "$ALGO" --dataset "$DATASET" \
  --test_env 3 --output_dir outputs/ERM/ERM_te3 &

wait
echo "All run(s) finished."