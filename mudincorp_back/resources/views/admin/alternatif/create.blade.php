@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Tambah Alternatif</h1>
    <form action="{{ route('admin.alternatif.store') }}" method="POST">
        @csrf
        <div class="form-group">
            <label for="kode_prodi">Kode Prodi</label>
            <input type="text" name="kode_prodi" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="nama_prodi">Nama Prodi</label>
            <input type="text" name="nama_prodi" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-success">Simpan</button>
        <a href="{{ route('admin.alternatif.index') }}" class="btn btn-secondary">Kembali</a>
    </form>
</div>
@endsection