@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Edit Alternatif</h1>
    <form action="{{ route('admin.alternatif.update', $alternatif->id) }}" method="POST">
        @csrf
        @method('PUT')
        <div class="form-group">
            <label for="kode_prodi">Kode Prodi</label>
            <input type="text" name="kode_prodi" value="{{ $alternatif->kode_prodi }}" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="nama_prodi">Nama Prodi</label>
            <input type="text" name="nama_prodi" value="{{ $alternatif->nama_prodi }}" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-success">Update</button>
        <a href="{{ route('admin.alternatif.index') }}" class="btn btn-secondary">Kembali</a>
    </form>
</div>
@endsection